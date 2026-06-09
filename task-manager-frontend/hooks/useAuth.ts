/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Cookies from "js-cookie";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post("/auth/login", data);
      console.log("✅ Full Login Response:", res.data);
      return res.data;
    },
    onSuccess: (data) => {
      console.log("🎉 Login Successful!", data);

      Cookies.set("accessToken", data.data.accessToken, { expires: 1 });
      if (data.data.refreshToken)
        Cookies.set("refreshToken", data.data.refreshToken, { expires: 7 });

      const user = data.data.user || data.data;
      const normalizedUser = { ...user, id: user._id || user.id };

      queryClient.setQueryData(["user"], normalizedUser);

      setTimeout(() => (window.location.href = "/dashboard"), 300);
    },
    onError: (error: any) => {
      console.error("❌ Full Login Error Object:", error);
      console.error("❌ Error Response:", error.response);
      console.error("❌ Error Data:", error.response?.data);
      console.error("❌ Error Status:", error.response?.status);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed. Please check backend.";

      // toast.error(message);   // uncomment later
      alert("Login Error: " + message); // Temporary alert for quick debug
    },
  });
};

// Rest of the file (useCurrentUser, useLogout, useRegister)
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      console.log("👤 /auth/me Response:", res.data);
      const user = res.data.user || res.data;
      return { ...user, id: user._id || user.id };
    },
    retry: false,
    enabled: !!Cookies.get("accessToken"),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    queryClient.clear();
    window.location.href = "/login";
  };
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
    }) => {
      const res = await api.post("/auth/register", data);
      return res.data;
    },
  });
};