/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SignupPage from '@/app/(auth)/signup/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const mockSignUp = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: mockSignUp,
    },
  })),
}));

describe('SignupPage', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
  });

  it('should render signup form correctly', () => {
    render(<SignupPage />);

    expect(screen.getByText('송도파트너스피엠오')).toBeInTheDocument();
    expect(screen.getByText('회원가입')).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일 주소/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호 입력')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호 재입력')).toBeInTheDocument();
    expect(screen.getByLabelText('회사명')).toBeInTheDocument();
    expect(screen.getByLabelText('사업자등록번호')).toBeInTheDocument();
    expect(screen.getByLabelText('전화번호')).toBeInTheDocument();
  });

  it('should render login link', () => {
    render(<SignupPage />);

    const loginLink = screen.getByText('로그인');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('should display password requirements checklist', () => {
    render(<SignupPage />);

    expect(screen.getByText('8자 이상')).toBeInTheDocument();
    expect(screen.getByText('소문자 (a-z)')).toBeInTheDocument();
    expect(screen.getByText('대문자 (A-Z)')).toBeInTheDocument();
    expect(screen.getByText('숫자 (0-9)')).toBeInTheDocument();
    expect(screen.getByText('특수문자')).toBeInTheDocument();
  });

  it('should validate password requirements in real-time', () => {
    render(<SignupPage />);

    const passwordInput = screen.getByPlaceholderText('비밀번호 입력');

    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    expect(screen.getByText('8자 이상').className).toContain('text-slate-500');

    fireEvent.change(passwordInput, { target: { value: 'Strong123!' } });
    expect(screen.getByText('8자 이상').className).toContain('text-green-400');
    expect(screen.getByText('소문자 (a-z)').className).toContain('text-green-400');
    expect(screen.getByText('대문자 (A-Z)').className).toContain('text-green-400');
    expect(screen.getByText('숫자 (0-9)').className).toContain('text-green-400');
    expect(screen.getByText('특수문자').className).toContain('text-green-400');
  });

  it('should validate password match', () => {
    render(<SignupPage />);

    const passwordInput = screen.getByPlaceholderText('비밀번호 입력');
    const confirmInput = screen.getByPlaceholderText('비밀번호 재입력');

    fireEvent.change(passwordInput, { target: { value: 'Strong123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Different123!' } });

    expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();

    fireEvent.change(confirmInput, { target: { value: 'Strong123!' } });

    expect(screen.getByText('비밀번호가 일치합니다.')).toBeInTheDocument();
  });

  it('should disable submit button when password is weak', () => {
    render(<SignupPage />);

    const submitButton = screen.getByRole('button', { name: /가입하기/i });
    expect(submitButton).toBeDisabled();

    const passwordInput = screen.getByPlaceholderText('비밀번호 입력');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when password is valid', () => {
    render(<SignupPage />);

    const passwordInput = screen.getByPlaceholderText('비밀번호 입력');
    const confirmInput = screen.getByPlaceholderText('비밀번호 재입력');
    const submitButton = screen.getByRole('button', { name: /가입하기/i });

    fireEvent.change(passwordInput, { target: { value: 'Strong123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Strong123!' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('should handle successful signup', async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });

    render(<SignupPage />);

    const emailInput = screen.getByLabelText(/이메일 주소/);
    const passwordInput = screen.getByPlaceholderText('비밀번호 입력');
    const confirmInput = screen.getByPlaceholderText('비밀번호 재입력');
    const businessInput = screen.getByLabelText('회사명');
    const bizNumInput = screen.getByLabelText('사업자등록번호');
    const phoneInput = screen.getByLabelText('전화번호');
    const submitButton = screen.getByRole('button', { name: /가입하기/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Strong123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Strong123!' } });
    fireEvent.change(businessInput, { target: { value: 'Test Company' } });
    fireEvent.change(bizNumInput, { target: { value: '123-45-67890' } });
    fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Strong123!',
        options: {
          data: {
            business_name: 'Test Company',
            business_number: '123-45-67890',
            phone: '010-1234-5678',
          },
          emailRedirectTo: expect.stringContaining('/pending'),
        },
      });
      // Security: password no longer stored in sessionStorage
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('pending_email', 'test@example.com');
      expect(mockPush).toHaveBeenCalledWith('/pending');
    });
  });

  it('should display error message on failed signup', async () => {
    mockSignUp.mockResolvedValueOnce({
      error: { message: 'User already registered' },
    });

    render(<SignupPage />);

    const emailInput = screen.getByLabelText(/이메일 주소/);
    const passwordInput = screen.getByPlaceholderText('비밀번호 입력');
    const confirmInput = screen.getByPlaceholderText('비밀번호 재입력');
    const businessInput = screen.getByLabelText('회사명');
    const bizNumInput = screen.getByLabelText('사업자등록번호');
    const phoneInput = screen.getByLabelText('전화번호');
    const submitButton = screen.getByRole('button', { name: /가입하기/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Strong123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Strong123!' } });
    fireEvent.change(businessInput, { target: { value: 'Test Company' } });
    fireEvent.change(bizNumInput, { target: { value: '123-45-67890' } });
    fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('User already registered')).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', () => {
    render(<SignupPage />);

    const passwordInput = screen.getByPlaceholderText('비밀번호 입력') as HTMLInputElement;
    const toggleButtons = screen.getAllByLabelText('비밀번호 보기');

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButtons[0]);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButtons[0]);
    expect(passwordInput.type).toBe('password');
  });

  it('should require all mandatory fields', () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText(/이메일 주소/) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('비밀번호 입력') as HTMLInputElement;
    const confirmInput = screen.getByPlaceholderText('비밀번호 재입력') as HTMLInputElement;
    const businessInput = screen.getByLabelText('회사명') as HTMLInputElement;
    const bizNumInput = screen.getByLabelText('사업자등록번호') as HTMLInputElement;
    const phoneInput = screen.getByLabelText('전화번호') as HTMLInputElement;

    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
    expect(confirmInput.required).toBe(true);
    expect(businessInput.required).toBe(true);
    expect(bizNumInput.required).toBe(true);
    expect(phoneInput.required).toBe(true);
  });
});
