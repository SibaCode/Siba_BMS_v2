import { useState } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const ContactPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await addDoc(collection(db, "contact"), {
        fullName: form.fullName,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        createdAt: Timestamp.now(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Error saving contact:", err);
      setError("Failed to send request. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-tr from-blue-600 via-blue-400 to-white text-indigo-900 px-6">
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
        <p className="max-w-md text-center">
          Your request has been received. We will contact you soon to start your onboarding process.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-600 via-blue-400 to-white text-indigo-900 flex items-center justify-center px-6 py-20">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center">Request Access</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <label className="block mb-4">
          <span className="text-gray-700 font-semibold">Full Name *</span>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-600 focus:ring focus:ring-blue-200 outline-none"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700 font-semibold">Business Name *</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-600 focus:ring focus:ring-blue-200 outline-none"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700 font-semibold">Email *</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-600 focus:ring focus:ring-blue-200 outline-none"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700 font-semibold">Phone Number</span>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-600 focus:ring focus:ring-blue-200 outline-none"
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700 font-semibold">Message</span>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            placeholder="Any questions or details..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-600 focus:ring focus:ring-blue-200 outline-none resize-none"
          />
        </label>

        <Button type="submit" size="lg" className="w-full bg-blue-700 text-white font-semibold hover:bg-blue-800 transition">
          Send Request
        </Button>
      </form>
    </div>
  );
};

export default ContactPage;
