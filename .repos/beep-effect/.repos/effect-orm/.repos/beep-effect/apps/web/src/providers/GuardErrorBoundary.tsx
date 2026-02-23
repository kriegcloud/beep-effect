"use client";

import React from "react";

type GuardErrorBoundaryProps = {
  readonly fallback: (params: { reset: () => void }) => React.ReactNode;
  readonly onReset?: (() => void) | undefined;
  readonly children: React.ReactNode;
};

type GuardErrorBoundaryState = {
  readonly hasError: boolean;
};

export class GuardErrorBoundary extends React.Component<GuardErrorBoundaryProps, GuardErrorBoundaryState> {
  public override state: GuardErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): GuardErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: unknown, errorInfo: React.ErrorInfo): void {
    console.error("GuardErrorBoundary caught an error", error, errorInfo);
  }

  private readonly handleReset = () => {
    this.setState({ hasError: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public override render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback({ reset: this.handleReset });
    }

    return this.props.children;
  }
}
