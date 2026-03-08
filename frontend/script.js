document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("login-form");
const message = document.getElementById("login-message");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "wait a minute!";
    message.className = "form-message";

    const formData = new FormData(form);
    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Login failed");
      }

      const data = await res.json();
      
      // Store token and role in localStorage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      if (data.user && data.user.role) {
        localStorage.setItem("userRole", data.user.role);
      }
      
      message.textContent = "Login successful!";
      message.className = "form-message success";
      console.log("Login response:", data);
      
      // Redirect based on role after a short delay
      setTimeout(() => {
        const role = data.user?.role;
        if (role === "student") {
          window.location.href = "student-dashboard.html";
        } else if (role === "teacher") {
          window.location.href = "teacher-dashboard.html";
        } else {
          // Fallback: redirect to home if role is missing/unknown
          window.location.href = "index.html";
        }
      }, 1000);
    } catch (err) {
      message.textContent = err.message || "Something went wrong";
      message.className = "form-message error";
    }
  });
}

// Signup form
const signupForm = document.getElementById("signup-form");
const signupMessage = document.getElementById("signup-message");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    signupMessage.textContent = "Creating your KalaGhar account...";
    signupMessage.className = "form-message";

    const formData = new FormData(signupForm);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      location: formData.get("location"),
    };

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Registration failed");
      }

      signupMessage.textContent = "Account created! You can now log in.";
      signupMessage.className = "form-message success";
      console.log("Signup response:", data);
    } catch (err) {
      signupMessage.textContent = err.message || "Something went wrong";
      signupMessage.className = "form-message error";
    }
  });
}


