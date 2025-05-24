import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "./firebaseconfig";
import { registerApi } from "./authApi";
import { login } from "./authContext";

export default function Register2() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Register with email/password
const handleSubmit = async (e) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }
  
  setLoading(true);
  setError("");
  
  try {
    // Step 1: Register with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );
    
    const firebaseUser = userCredential.user;
    console.log("Firebase registration successful:", firebaseUser);
    
    // Step 2: Register with your backend using the Firebase user
    const backendResponse = await registerApi(firebaseUser);
    console.log("Backend registration successful:", backendResponse);
    
    // Use the login function from AuthContext to set user data and token
    login(backendResponse.user, backendResponse.accessToken);
    
    // Navigate to home
    navigate("/home");
  } catch (error) {
    console.error("Registration error:", error);
    setError(error.message || "Registration failed. Please try again.");
  } finally {
    setLoading(false);
  }
};
// Google sign in (works for both login and register)
const handleGoogleSignIn = async () => {
  setError(null);
  setLoading(true);
  try {
    // Firebase Google authentication
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Get user data from your backend using Firebase token
    const data = await loginApi(firebaseUser);

    // Update authentication context
    login(data.user, data.accessToken);
    
    navigate("/home");
  } catch (error) {
    console.error("Google authentication failed", error);

    // Handle specific errors
    if (error.response && error.response.status === 404) {
      setError("User not found. Please register first with Google.");
    } else {
      setError("Google authentication failed. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Fill in the details to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && <div className="text-red-500 text-center">{error}</div>}
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-700" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
            <Button
  type="button"
  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-sm mt-4"
  onClick={handleGoogleSignIn}
  disabled={loading}
>
  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
  {loading ? "Signing up with Google..." : "Sign up with Google"}
</Button>
            <div className="text-center text-sm mt-4">
              Already have an account?{" "}
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
