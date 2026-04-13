import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ message: 'Credential missing' }, { status: 400 });
    }

    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ message: 'Invalid token payload' }, { status: 400 });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Find or Create User
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user for first-time google login
      user = await User.create({
        fullName: name || 'Google User',
        email: email,
        password: Math.random().toString(36).slice(-12), // Random password for schema requirement
        googleId,
        avatar: picture
      });
    }

    // Generate our app's JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'ROJGAR_MATCH_SECURE_TOKEN_2026',
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profile: user.profile,
        isNew: !user.googleId // Optional flag
    }, { status: 200 });

    // Set standard app cookie
    response.headers.set('Set-Cookie', serialize('rojgarmatch_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    }));

    return response;
  } catch (error) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ message: 'Authentication failed' }, { status: 500 });
  }
}
