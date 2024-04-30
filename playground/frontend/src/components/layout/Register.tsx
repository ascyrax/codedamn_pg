import { useState } from "react";
import { postRegisterData } from "../../services/services";
import { RegisterProps } from "../../models/interfaces";

function Register({ setNeedToRegister }: RegisterProps) {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would usually integrate your backend API
    let regResponseFromServer = await postRegisterData(user);
    if (regResponseFromServer.success)
      console.log("registration successful", regResponseFromServer);
    else console.log("registration could not complete.");
  };

  const handleClick = () => {
    setNeedToRegister(false);
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={user.username}
            onChange={handleChange}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Register</button>
      </form>
      <div className="goto">
        Already Registered ?
        <button type="button" onClick={handleClick}>
          Go to Login
        </button>
      </div>
    </div>
  );
}

export default Register;
