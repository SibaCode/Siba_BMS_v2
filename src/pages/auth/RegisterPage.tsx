// src/pages/RegisterPage.tsx
import { useState } from "react";
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import logo from "@/lib/logo.png"; // replace with your logo path

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bizName, setBizName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        bizName,
      });

      await setDoc(doc(db, "businessInfo", user.uid), {
        name: bizName,
        email,
        createdAt: new Date(),
      });

      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1800ad]/10 to-[#1800ad]/20 px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-[10rem] w-[10rem] object-contain" />
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold mb-2 text-center text-[#1800ad]">Create Account</h1>
        <p className="text-center text-gray-600 mb-6">Register your business to get started</p>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <Label htmlFor="bizName" className="text-gray-700">Business Name</Label>
            <Input
              id="bizName"
              type="text"
              placeholder="e.g. Zuzakuhle Traders"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full text-white font-semibold bg-[#1800ad] hover:bg-[#14008a] transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-[#1800ad] hover:underline font-medium">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
