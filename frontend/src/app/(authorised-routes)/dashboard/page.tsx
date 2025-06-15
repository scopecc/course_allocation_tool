import { Card } from "@/components/ui";
import { Table } from "lucide-react";
import React from "react";

const Dashboard = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center my-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p> View and manage your drafts here. </p>
      </div>
      <Card>
      </Card>
    </div>
  )
};

export default Dashboard;
