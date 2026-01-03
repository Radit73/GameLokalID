import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createUser, findUserByEmail } from '../models/userModel.js';
import { logAction } from '../utils/logger.js';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'supersecretkey';
const adminAccessCode = process.env.ADMIN_ACCESS_CODE || 'GL-ADMIN-2024';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, profilePhoto } = req.body;

    if (!name || !email || !password || !profilePhoto) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const allowedRoles = ['USER'];
    const chosenRole = allowedRoles.includes(role) ? role : 'USER';

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await createUser(name, email, hashed, chosenRole, profilePhoto);

    await logAction(
      { ...req, user: { id: newUser.id, role: chosenRole } },
      {
        action: 'REGISTER',
        meta: { email, role: chosenRole },
      },
    );

    return res.status(201).json({
      id: newUser.id,
      name,
      email,
      role: chosenRole,
      profilePhoto,
    });
  } catch (error) {
    console.error('Register error', error);
    return res.status(500).json({ message: 'Gagal mendaftar.' });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, passcode, profilePhoto } = req.body;

    if (!name || !email || !password || !passcode) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    if (passcode !== adminAccessCode) {
      return res.status(403).json({ message: 'Kode akses admin tidak valid.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email sudah terdaftar.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await createUser(name, email, hashed, 'ADMIN', profilePhoto || null);

    await logAction(
      { ...req, user: { id: newUser.id, role: 'ADMIN' } },
      { action: 'REGISTER_ADMIN', meta: { email } },
    );

    return res.status(201).json({
      id: newUser.id,
      name,
      email,
      role: 'ADMIN',
      profilePhoto: newUser.profilePhoto || profilePhoto || null,
    });
  } catch (error) {
    console.error('Register admin error', error);
    return res.status(500).json({ message: 'Gagal mendaftar admin.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePhoto: user.profile_photo || null,
    };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '2h' });

    await logAction(
      { ...req, user: { id: user.id, role: user.role } },
      { action: 'LOGIN_SUCCESS', meta: { email } },
    );

    return res.json({ token, user: payload });
  } catch (error) {
    console.error('Login error', error);
    return res.status(500).json({ message: 'Gagal login.' });
  }
};
