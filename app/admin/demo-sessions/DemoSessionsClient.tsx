"use client";

import { useState } from "react";
import DemoSessionManagement from "../components/DemoSessionManagement";
import SessionSignups from "../components/SessionSignups";
import type { DemoSession } from "../api/fetchDemoSessions";

interface DemoSessionsClientProps {
  initialSessions: DemoSession[];
}

export default function DemoSessionsClient({ initialSessions }: DemoSessionsClientProps) {
  const [currentView, setCurrentView] = useState<"sessions" | "signups">("sessions");
  const [selectedSession, setSelectedSession] = useState<DemoSession | null>(null);

  const handleSessionSelect = (session: DemoSession) => {
    setSelectedSession(session);
    setCurrentView("signups");
  };

  const handleBackToSessions = () => {
    setCurrentView("sessions");
    setSelectedSession(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
      {currentView === "sessions" ? (
        <DemoSessionManagement
          initialSessions={initialSessions}
          onSessionSelect={handleSessionSelect}
        />
      ) : selectedSession ? (
        <SessionSignups session={selectedSession} onBack={handleBackToSessions} />
      ) : null}
    </div>
  );
}
