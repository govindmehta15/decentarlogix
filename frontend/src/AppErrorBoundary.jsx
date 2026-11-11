import { Component } from "react";

export default class AppErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main role="alert" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", background: "#f6f7f9", color: "#172534", fontFamily: "system-ui, sans-serif" }}>
        <section style={{ maxWidth: "440px", padding: "32px", background: "white", border: "1px solid #dfe4ea", borderRadius: "16px" }}>
          <p style={{ fontSize: "12px", letterSpacing: "1px", color: "#607083" }}>LET’S GET YOU BACK</p>
          <h1 style={{ fontSize: "26px", lineHeight: 1.2 }}>This page needs a fresh start.</h1>
          <p style={{ lineHeight: 1.7 }}>Something interrupted this view. Reload the page to try again, or return to the homepage. Unsaved changes may be lost.</p>
          <button onClick={() => window.location.reload()} style={{ background: "#172534", color: "white", border: 0, borderRadius: "8px", padding: "12px 18px", cursor: "pointer", font: "inherit" }}>Reload page</button>
          <a href="/" style={{ display: "inline-block", marginLeft: "18px", color: "#172534" }}>Go home</a>
        </section>
      </main>
    );
  }
}
