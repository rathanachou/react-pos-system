import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import { resolve } from "path"; 

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": resolve(__dirname, "./src"),
   
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["recharts"],
  },
});