// import React from "react";
// import { connection } from "next/server";
// import AdminPage from "./AdminPage";

// const AdminOverviewPage = async () => {
//   // cacheComponents সক্রিয় থাকলে এটি সেগমেন্টটিকে বিল্ড-টাইমে ক্যাশ না করে রানটাইমে রেন্ডার করাবে
//   await connection();

//   return (
//     <div>
//       <AdminPage></AdminPage>
//     </div>
//   );
// };

// export default AdminOverviewPage;

// app/admin/page.tsx
"use client";

import AdminPage from "./AdminPage";

export default function Page() {
  return <AdminPage />;
}
