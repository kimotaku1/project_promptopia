"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { use } from "react";

import Profile from "@components/Profile";

const UserProfile = ({ params: paramsPromise }) => {
  const searchParams = useSearchParams();
  const userName = searchParams.get("name");

  const params = use(paramsPromise); // Unwrapping the Promise

  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}/posts`);
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setUserPosts(data);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) fetchPosts();
  }, [params.id]);

  if (!params?.id || !userName) return <div>User not found</div>;

  if (isLoading) return <div>Loading...</div>;

  return (
    <Profile
      name={userName}
      desc={`Welcome to ${userName}'s personalized profile page. Explore ${userName}'s exceptional prompts and be inspired by the power of their imagination`}
      data={userPosts}
    />
  );
};

export default UserProfile;
