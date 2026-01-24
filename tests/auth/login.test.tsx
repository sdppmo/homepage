/**
 * @vitest-environment jsdom
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

// Mock the server action
const mockLogin = vi.fn();
vi.mock('@/app/(auth)/login/actions', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}));

describe('LoginPage', () => {
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue({ get: mockGet });
    mockGet.mockReturnValue(null); // Default: no redirect param
    // Default: server action returns null (no error)
    mockLogin.mockResolvedValue(null);
  });

  it('should render login form correctly', async () => {
    await act(async () => {
      render(<LoginPage />);
    });

    expect(screen.getByText('송도파트너스피엠오')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
    expect(screen.getByLabelText('이메일 주소')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });

  it('should render password reset link', async () => {
    await act(async () => {
      render(<LoginPage />);
    });

    const resetLink = screen.getByText('비밀번호 찾기');
    expect(resetLink).toBeInTheDocument();
    expect(resetLink.closest('a')).toHaveAttribute('href', '/reset-password');
  });

  it('should render signup link', async () => {
    await act(async () => {
      render(<LoginPage />);
    });

    const signupLink = screen.getByText('회원가입');
    expect(signupLink).toBeInTheDocument();
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
  });

  it('should toggle password visibility', async () => {
    await act(async () => {
      render(<LoginPage />);
    });

    const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;
    const toggleButton = screen.getByLabelText('비밀번호 보기');

    expect(passwordInput.type).toBe('password');

    await act(async () => {
      fireEvent.click(toggleButton);
    });
    expect(passwordInput.type).toBe('text');

    await act(async () => {
      fireEvent.click(toggleButton);
    });
    expect(passwordInput.type).toBe('password');
  });

  it('should call server action on form submit', async () => {
    mockLogin.mockResolvedValue(null);

    await act(async () => {
      render(<LoginPage />);
    });

    const emailInput = screen.getByLabelText('이메일 주소');
    const passwordInput = screen.getByLabelText('비밀번호');
    const form = screen.getByRole('button', { name: /로그인/i }).closest('form')!;

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

    // Verify the FormData contains correct values
    const callArgs = mockLogin.mock.calls[0];
    const formData = callArgs[1] as FormData;
    expect(formData.get('email')).toBe('test@example.com');
    expect(formData.get('password')).toBe('Password123!');
  });

  it('should include redirect URL in form data', async () => {
    mockGet.mockReturnValue('/k-col/calculator');
    mockLogin.mockResolvedValue(null);

    await act(async () => {
      render(<LoginPage />);
    });

    const emailInput = screen.getByLabelText('이메일 주소');
    const passwordInput = screen.getByLabelText('비밀번호');
    const form = screen.getByRole('button', { name: /로그인/i }).closest('form')!;

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

  it('should display error message when server action returns error', async () => {
    mockLogin.mockResolvedValue({ error: 'Invalid login credentials' });

    await act(async () => {
      render(<LoginPage />);
    });

    const emailInput = screen.getByLabelText('이메일 주소');
    const passwordInput = screen.getByLabelText('비밀번호');
    const form = screen.getByRole('button', { name: /로그인/i }).closest('form')!;

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

  it('should display Korean error message for missing credentials', async () => {
    mockLogin.mockResolvedValue({ error: '이메일과 비밀번호를 모두 입력해주세요.' });

    await act(async () => {
      render(<LoginPage />);
    });

    const form = screen.getByRole('button', { name: /로그인/i }).closest('form')!;

    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(screen.getByText('이메일과 비밀번호를 모두 입력해주세요.')).toBeInTheDocument();
    });
  });

  it('should require email and password fields', async () => {
    await act(async () => {
      render(<LoginPage />);
    });

    const emailInput = screen.getByLabelText('이메일 주소') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;

    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
  });

  it('should have correct input types', async () => {
    await act(async () => {
      render(<LoginPage />);
    });

    const emailInput = screen.getByLabelText('이메일 주소') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('비밀번호') as HTMLInputElement;

    expect(emailInput.type).toBe('email');
    expect(passwordInput.type).toBe('password');
  });

  it('should have hidden redirect input with default value', async () => {
    mockGet.mockReturnValue(null);

    await act(async () => {
      render(<LoginPage />);
    });

    const hiddenInput = document.querySelector('input[name="redirect"]') as HTMLInputElement;
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput.type).toBe('hidden');
    expect(hiddenInput.value).toBe('/');
  });

  it('should have hidden redirect input with custom value', async () => {
    mockGet.mockReturnValue('/dashboard');

    await act(async () => {
      render(<LoginPage />);
    });

    const hiddenInput = document.querySelector('input[name="redirect"]') as HTMLInputElement;
    expect(hiddenInput.value).toBe('/dashboard');
  });
});
