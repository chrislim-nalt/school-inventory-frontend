import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    schoolCode: "",
    schoolName: "",
    registrationType: "join", // "join" or "new"
  });
  const [step, setStep] = useState("register");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
      };
      
      if (form.registrationType === "join") {
        if (!form.schoolCode) {
          setError("Please enter your school code");
          setLoading(false);
          return;
        }
        payload.schoolCode = form.schoolCode;
      } else {
        if (!form.schoolName) {
          setError("Please enter your school name");
          setLoading(false);
          return;
        }
        payload.schoolName = form.schoolName;
      }
      
      const res = await API.post("/auth/register", payload);
      setUserEmail(form.email);
      setSchoolInfo({
        schoolName: res.data.schoolName,
        schoolCode: res.data.schoolCode,
        role: res.data.role,
        isNewSchool: form.registrationType === "new",
      });
      setStep("otp");
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/verify-otp", { email: userEmail, otp });
      setSchoolInfo({
        schoolName: res.data.schoolName,
        schoolCode: res.data.schoolCode,
        role: res.data.role,
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/resend-otp", { email: userEmail });
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (schoolInfo?.schoolCode) {
      navigator.clipboard.writeText(schoolInfo.schoolCode);
      alert("School code copied to clipboard!");
    }
  };

  // OTP Verification Step
  if (step === "otp") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm relative z-10 transition-all duration-500 hover:shadow-2xl">
          <div className="text-center mb-5">
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-40 animate-ping"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full p-2 shadow-lg animate-bounce-slow">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] whitespace-nowrap">
                Verify Your Email
              </h2>
            </div>
            
            <div className="flex justify-center mt-2">
              <div className="h-0.5 w-12 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs text-center">
                ❌ {error}
              </div>
            )}
            
            <p className="text-center text-sm text-gray-600">
              We've sent a verification code to <br />
              <strong className="text-blue-600">{userEmail}</strong>
            </p>

            {/* School Information Card - SHOWS SCHOOL CODE */}
            {schoolInfo && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                <div className="text-center">
                  <p className="text-xs text-green-600 font-semibold">🏫 School Information</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{schoolInfo.schoolName}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">School Code:</span>
                    <code className="bg-white px-3 py-1 rounded-lg text-sm font-mono font-bold text-blue-600 border">
                      {schoolInfo.schoolCode}
                    </code>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition"
                      title="Copy school code"
                    >
                      📋 Copy
                    </button>
                  </div>
                  {schoolInfo.isNewSchool && (
                    <p className="text-xs text-green-600 mt-2">
                      ✨ Share this code with other staff members to join your school!
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Role: <span className="font-semibold capitalize">{schoolInfo.role}</span>
                  </p>
                </div>
              </div>
            )}

            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              className="w-full px-3 py-2 text-sm text-center text-2xl font-mono tracking-wider border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-300 focus:scale-105"
              autoFocus
              required
            />

            <button
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex justify-center items-center transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </button>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-xs text-gray-500">
                  Resend code in {resendTimer} seconds
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Didn't receive code? Resend
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep("register");
                setOtp("");
                setError("");
              }}
              className="w-full text-gray-500 text-xs hover:text-gray-700 mt-2"
            >
              ← Back to registration
            </button>
          </form>
        </div>

        <style>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient { animation: gradient 3s ease infinite; background-size: 200% auto; }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.5s ease-out 0.2s both; }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
        `}</style>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm relative z-10 transition-all duration-500 hover:shadow-2xl">
        <div className="text-center mb-5">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-40 animate-ping"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full p-2 shadow-lg animate-bounce-slow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] whitespace-nowrap">
              Create Account
            </h2>
          </div>
          
          <div className="flex justify-center mt-2">
            <div className="h-0.5 w-12 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 rounded-full animate-pulse"></div>
          </div>
          
          <p className="text-gray-500 mt-3 text-xs animate-fade-in">
            Join an existing school or create a new one
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs text-center">
            ❌ {error}
          </div>
        )}

        {/* Registration Type Toggle */}
        <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setForm({ ...form, registrationType: "join", schoolCode: "", schoolName: "" })}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              form.registrationType === "join"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            🔑 Join School
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, registrationType: "new", schoolCode: "", schoolName: "" })}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              form.registrationType === "new"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            🏫 New School
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-300 focus:scale-105"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-300 focus:scale-105"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-300 focus:scale-105"
            required
          />

          {form.registrationType === "join" ? (
            <div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔑</span>
                <input
                  name="schoolCode"
                  placeholder="School Code (e.g., GSR1234)"
                  value={form.schoolCode}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-300 focus:scale-105"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Enter the school code provided by your school administrator
              </p>
            </div>
          ) : (
            <div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏫</span>
                <input
                  name="schoolName"
                  placeholder="School Name"
                  value={form.schoolName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-300 focus:scale-105"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Your school will be created and you'll become the administrator
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex justify-center items-center transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-xs text-center mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors duration-300 relative inline-block group">
            Login
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient { animation: gradient 3s ease infinite; background-size: 200% auto; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out 0.2s both; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}