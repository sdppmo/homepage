/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import LoginPage from '@/app/(auth)/login/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(),
}));

const mockLogin = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockSignInWithKakao = vi.fn();

vi.mock('@/app/(auth)/login/actions', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
  signInWithKakao: (...args: unknown[]) => mockSignInWithKakao(...args),
}));

async function renderAndWait(component: React.ReactElement) {
  let result;
  await act(async () => {
    result = render(component);
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  return result;
}

async function expandEmailForm() {
  const emailLoginButton = screen.getByRole('button', { name: '이메일로 로그인' });
  await act(async () => {
    fireEvent.click(emailLoginButton);
  });
}

describe('LoginPage', () => {
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({ get: mockGet });
    mockGet.mockReturnValue(null); // Default: no redirect param
    // Default: server action returns null (no error)
    mockLogin.mockResolvedValue(null);
    mockSignInWithGoogle.mockResolvedValue(undefined);
    mockSignInWithKakao.mockResolvedValue(undefined);
  });

  describe('Initial render (social login view)', () => {
    it('should render company name and description', async () => {
      await renderAndWait(<LoginPage />);

      expect(screen.getByText('송도파트너스피엠오')).toBeInTheDocument();
      expect(screen.getByText('K-COL 철골기둥 설계 플랫폼')).toBeInTheDocument();
    });

    it('should render social login buttons', async () => {
      await renderAndWait(<LoginPage />);

      expect(screen.getByRole('button', { name: /Google로 계속하기/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /카카오로 계속하기/i })).toBeInTheDocument();
    });

    it('should render email login expand button', async () => {
      await renderAndWait(<LoginPage />);

      expect(screen.getByRole('button', { name: '이메일로 로그인' })).toBeInTheDocument();
    });

    it('should render signup link', async () => {
      await renderAndWait(<LoginPage />);

      const signupLink = screen.getByText('회원가입');
      expect(signupLink).toBeInTheDocument();
      expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
    });

    // Terms and privacy links were removed per user request (2026-01-25)

    it('should NOT show email form by default', async () => {
      await renderAndWait(<LoginPage />);

      expect(screen.queryByLabelText('이메일')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('비밀번호')).not.toBeInTheDocument();
    });
  });

  describe('Social login', () => {
    it('should call signInWithGoogle when Google button is clicked', async () => {
      await renderAndWait(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /Google로 계속하기/i });
      await act(async () => {
        fireEvent.click(googleButton);
      });

      expect(mockSignInWithGoogle).toHaveBeenCalledWith('/');
    });

    it('should call signInWithKakao when Kakao button is clicked', async () => {
      await renderAndWait(<LoginPage />);

      const kakaoButton = screen.getByRole('button', { name: /카카오로 계속하기/i });
      await act(async () => {
        fireEvent.click(kakaoButton);
      });

      expect(mockSignInWithKakao).toHaveBeenCalledWith('/');
    });

    it('should pass redirect URL to social login functions', async () => {
      mockGet.mockReturnValue('/k-col/calculator');
      await renderAndWait(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /Google로 계속하기/i });
      await act(async () => {
        fireEvent.click(googleButton);
      });

      expect(mockSignInWithGoogle).toHaveBeenCalledWith('/k-col/calculator');
    });
  });

  describe('Email login form (expanded)', () => {
    it('should show email form when expand button is clicked', async () => {
      await renderAndWait(<LoginPage />);
      await expandEmailForm();

      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    });

    it('should render password reset link in expanded form', async () => {
      await renderAndWait(<LoginPage />);
      await expandEmailForm();

      const resetLink = screen.getByText('비밀번호를 잊으셨나요?');
      expect(resetLink).toBeInTheDocument();
      expect(resetLink.closest('a')).toHaveAttribute('href', '/reset-password');
    });

    it('should toggle password visibility', async () => {
      await renderAndWait(<LoginPage />);
      await expandEmailForm();

      const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;
      expect(passwordInput.type).toBe('password');

      // Find the toggle button (it's the button inside the password field container)
      const toggleButton = passwordInput.parentElement?.querySelector('button');
      expect(toggleButton).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(toggleButton!);
      });
      expect(passwordInput.type).toBe('text');

      await act(async () => {
        fireEvent.click(toggleButton!);
      });
      expect(passwordInput.type).toBe('password');
    });

    it('should call server action on form submit', async () => {
      mockLogin.mockResolvedValue(null);
      await renderAndWait(<LoginPage />);
      await expandEmailForm();

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');
      const form = screen.getByRole('button', { name: /이메일로 계속하기/i }).closest('form')!;

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      });

      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });

      const callArgs = mockLogin.mock.calls[0];
      const formData = callArgs[1] as FormData;
      expect(formData.get('email')).toBe('test@example.com');
      expect(formData.get('password')).toBe('Password123!');
    });

    it('should include redirect URL in form data', async () => {
      mockGet.mockReturnValue('/k-col/calculator');
      mockLogin.mockResolvedValue(null);
      await renderAndWait(<LoginPage />);
      await expandEmailForm();

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');
      const form = screen.getByRole('button', { name: /이메일로 계속하기/i }).closest('form')!;

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      });

      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });

      const callArgs = mockLogin.mock.calls[0];
      const formData = callArgs[1] as FormData;
      expect(formData.get('redirect')).toBe('/k-col/calculator');
    });

    it('should require email and password fields', async () => {
      await renderAndWait(<LoginPage />);
      await expandEmailForm();

      const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
      const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;

      expect(emailInput.required).toBe(true);
      expect(passwordInput.required).toBe(true);
    });

    it('should have correct input types', async () => {
      await renderAndWait(<LoginPage />);
      await expandEmailForm();

      const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
      const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;

      expect(emailInput.type).toBe('email');
      expect(passwordInput.type).toBe('password');
    });

    it('should have hidden redirect input with default value', async () => {
      mockGet.mockReturnValue(null);
      await renderAndWait(<LoginPage />);
      await expandEmailForm();

      const hiddenInput = document.querySelector('input[name="redirect"]') as HTMLInputElement;
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput.type).toBe('hidden');
      expect(hiddenInput.value).toBe('/');
    });

    it('should have hidden redirect input with custom value', async () => {
      mockGet.mockReturnValue('/dashboard');
      await renderAndWait(<LoginPage />);
      await expandEmailForm();

      const hiddenInput = document.querySelector('input[name="redirect"]') as HTMLInputElement;
      expect(hiddenInput.value).toBe('/dashboard');
    });
  });

  describe('Error handling', () => {
    it('should display error message when server action returns error', async () => {
      mockLogin.mockResolvedValue({ error: 'Invalid login credentials' });
      await renderAndWait(<LoginPage />);
      await expandEmailForm();

      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');
      const form = screen.getByRole('button', { name: /이메일로 계속하기/i }).closest('form')!;

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      });

      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
      });
    });

    it('should display error from URL param', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'error') return 'auth_failed';
        return null;
      });
      await renderAndWait(<LoginPage />);

      expect(screen.getByText('인증에 실패했습니다. 다시 시도해주세요.')).toBeInTheDocument();
    });

    it('should display Korean error message for missing credentials', async () => {
      mockLogin.mockResolvedValue({ error: '이메일과 비밀번호를 모두 입력해주세요.' });
      await renderAndWait(<LoginPage />);
      await expandEmailForm();

      const form = screen.getByRole('button', { name: /이메일로 계속하기/i }).closest('form')!;

      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText('이메일과 비밀번호를 모두 입력해주세요.')).toBeInTheDocument();
      });
    });
  });
});
