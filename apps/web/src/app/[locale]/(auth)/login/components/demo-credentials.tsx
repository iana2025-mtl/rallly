"use client";

export function DemoCredentials() {
  return (
    <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4 mb-6">
      <h3 className="font-semibold text-blue-900 mb-3 text-lg">
        Demo Credentials
      </h3>
      <div className="space-y-2 text-sm mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-blue-800">Email:</span>
          <code className="bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono">
            demo@test.com
          </code>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-blue-800">Password:</span>
          <code className="bg-blue-100 px-2 py-1 rounded text-blue-900 font-mono">
            demo123456
          </code>
        </div>
      </div>
      <p className="text-xs text-blue-700">
        Use these credentials to log in. Registration is disabled in demo mode.
      </p>
    </div>
  );
}

