import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loginApi } from "./authApi";
import { useAuth } from "./authContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to initialize Google Login
  const initializeGoogleLogin = () => {
    window.google.accounts.id.initialize({
      client_id: "925173298479-3ecf18me9ar8rr32rmaouqemdleeg4t8.apps.googleusercontent.com",
      callback: handleGoogleLogin,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("google-login-button"),
      { theme: "filled_white", size: "large", width: "100%" }
    );
  };

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = initializeGoogleLogin;
    };

    loadGoogleScript();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = async (response) => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth0/google-login`, {
        token: response.credential,
      });
      login(data.user, data.token);
      const pendingKey = localStorage.getItem("pendingCourseJoin");
      if (pendingKey) {
        localStorage.removeItem("pendingCourseJoin");
        navigate(`/course/join/${pendingKey}`);
      } else {
        navigate("/home");
      }
      // navigate("/home");
    } catch (error) {
      console.error("Google login failed", error);
      setError("Google authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await loginApi(formData.email, formData.password);
      login(data.user, data.token);
      const pendingKey = localStorage.getItem("pendingCourseJoin");
      if (pendingKey) {
        localStorage.removeItem("pendingCourseJoin");
        navigate(`/course/join/${pendingKey}`);
      } else {
        navigate("/home");
      }
      // navigate("/home");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/d5756f61ad83429b8d94b2f33b9d9ea4/8438fdf3e8149084ed45099b71974cf199e146448a5b977414352412e96ce45b?placeholderIfAbsent=true"
                  alt="Spacroom Logo"
                  className="h-10 w-10 object-contain"
                />
                <h1 className="text-3xl font-bold text-blue-800">Spaceroom</h1>
              </div>
            </div>

          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11 rounded-lg"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-11 rounded-lg"
                  required
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium rounded-lg bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-sm text-gray-500">
                  or continue with
                </span>
              </div>
            </div>

            <div id="google-login-button" className="flex justify-center"></div>
          </CardContent>
          <CardFooter>
            <div className="text-center w-full text-sm">
              Don't have an account?{" "}
              <button
                type="button"
                className="font-medium text-blue-600 hover:underline"
                onClick={() => navigate("/register")}
              >
                Sign up
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}