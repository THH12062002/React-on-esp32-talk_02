import { h } from "preact";
import { useState } from "preact/hooks";
import { useLocation } from "wouter";
import {
  validateCredentials,
  getCurrentCredentials,
  setUserInfo,
} from "../utils/auth";

// Types
interface LoginFormProps {
  onLogin?: (role: string) => void;
}

interface FormState {
  username: string;
  password: string;
  language: string;
}

// Components
const PasswordInput = ({
  value,
  onChange,
  showPassword,
  setShowPassword,
  error,
}: {
  value: string;
  onChange: (e: Event) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  error?: string;
}) => (
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">Password</label>
    <div class="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        class={`input input-bordered w-full pr-10 ${
          error ? "input-error" : ""
        }`}
        placeholder="Enter your password"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        class="absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <EyeIcon showPassword={showPassword} />
      </button>
    </div>
    {error && <p class="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const EyeIcon = ({ showPassword }: { showPassword: boolean }) => (
  <svg
    class="h-5 w-5 text-gray-400 hover:text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    {showPassword ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
      />
    )}
  </svg>
);

// Custom Hook
const useForm = (initialState: FormState) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field !== "language") setError("");
  };

  return {
    formData,
    error,
    showPassword,
    setError,
    setShowPassword,
    handleInputChange,
  };
};

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [, setLocation] = useLocation();
  const [currentCredentials] = useState(getCurrentCredentials());

  const {
    formData,
    error,
    showPassword,
    setError,
    setShowPassword,
    handleInputChange,
  } = useForm({
    username: "",
    password: "",
    language: "English",
  });

  const handleSubmit = async (event: Event) => {
    event.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    const account = validateCredentials(formData.username, formData.password);
    if (account) {
      try {
        const userInfo = {
          username: account.username,
          role: account.role,
          isAuthenticated: true,
          timestamp: new Date().getTime(),
        };

        setUserInfo(userInfo);
        onLogin?.(account.role);
        setLocation("/");
      } catch (err) {
        console.error("Login error:", err);
        setError("An error occurred during login");
      }
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div class="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div class="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl">
        <div class="p-8">
          <h2 class="text-2xl font-bold text-center text-gray-800 mb-8">
            Login
          </h2>
          <form onSubmit={handleSubmit} class="space-y-6">
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange(
                      "username",
                      (e.target as HTMLInputElement).value
                    )
                  }
                  class={`input input-bordered w-full ${
                    error ? "input-error" : ""
                  }`}
                  placeholder="Enter your username"
                />
              </div>

              <PasswordInput
                value={formData.password}
                onChange={(e) =>
                  handleInputChange(
                    "password",
                    (e.target as HTMLInputElement).value
                  )
                }
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                error={error}
              />

              <button type="submit" class="btn btn-primary w-full">
                Log me in
              </button>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    handleInputChange(
                      "language",
                      (e.target as HTMLSelectElement).value
                    )
                  }
                  class="select select-bordered w-full"
                >
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
            </div>
          </form>

          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 text-center font-medium mb-2">
              Demo credentials:
            </p>
            <div class="font-mono text-sm text-gray-600 text-center">
              <p>Username: {currentCredentials.username}</p>
              <p>Password: {currentCredentials.password}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
