import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000", // 🔥 꼭 http:// 붙여야 한다
  headers: {
    "Content-Type": "application/json",
  },
});
