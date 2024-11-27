import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@utils/database";
import User from "@models/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      // Store the user id from MongoDB to session
      const sessionUser = await User.findOne({ email: session.user.email });
      session.user.id = sessionUser._id.toString();
      return session;
    },
    async signIn({ account, profile, user, credentials }) {
      try {
        await connectToDB();

        // Check if user already exists
        const userExists = await User.findOne({ email: profile.email });

        // If user doesn't exist, create a new user
        if (!userExists) {
          const username = profile.name
            .replace(" ", "")
            .toLowerCase()
            .slice(0, 20); // Ensure the username length is within limit

          // Validate username (alphanumeric only)
          const validUsername = /^[a-zA-Z0-9]+$/.test(username) ? username : `user_${Date.now()}`;

          await User.create({
            email: profile.email,
            username: validUsername,
            image: profile.picture,
          });
        }

        return true;
      } catch (error) {
        console.log("Error checking if user exists: ", error.message);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
