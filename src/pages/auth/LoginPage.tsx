// src/pages/LoginPage.tsx
import { useState } from "react";
import { auth, db } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";
import logo from "@/lib/logo.png"; // replace with your logo path

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setBizName } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const bizName = docSnap.data().bizName;
        if (setBizName) setBizName(bizName);
        navigate("/admin");
      } else {
        setError("User data not found.");
      }
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1800ad]/10 to-[#1800ad]/20 px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
        <img src={logo} alt="Logo" className="h-[10rem] w-[10rem] object-contain " />
        </div>

        {/* Header */}
        {/* <h1 className="text-3xl font-bold mb-1 text-center text-[#1800ad]">Welcome Back</h1> */}
        <p className="text-center text-gray-600 mb-6">Login to access your dashboard</p>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="********"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full text-white font-semibold bg-[#1800ad] hover:bg-[#14008a] transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <Link to="/forgot-password" className="text-[#1800ad] hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="text-center mt-2 text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-[#1800ad] hover:underline font-medium">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
