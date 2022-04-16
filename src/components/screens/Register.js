import React, { useState } from 'react'
import { Link } from "react-router-dom";
import { register } from '../../config/auth'
import { InputFields, ButtonStyle } from '../constants/styles';

const Register = () => {
    const [form, setForm] = useState({
        email: '',
        password: ''
    })
    const handleSubmit = async (e) => {
        e.preventDefault();
        await register(form);
    }
    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit} >
                <label for="email">Email</label>
                <input type="text" style={InputFields}
                    placeholder="email" id="mail"
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })} />
                <br />
                <label for="password">Password</label>
                <input type="password" placeholder="Password"
                    style={InputFields}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })} />
                <br />
                <button type="submit" style={ButtonStyle}>
                    Submit
                </button>
                <br />
                <Link to="/login">Already registered?</Link>
            </form>
        </div>

    )
}

export default Register
