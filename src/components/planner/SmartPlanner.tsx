"use client";

export function SmartPlanner() {
  return (
    <main className="planner-placeholder">
      <section className="planner-placeholder__shell">
        <div className="planner-placeholder__hero">
          <p className="planner-placeholder__eyebrow">Planner Compatibility Surface</p>
          <h1 className="planner-placeholder__title">The public planner lives in the CAD Suite runtime.</h1>
          <p className="planner-placeholder__copy">
            This root route remains as a controlled placeholder while planner route consolidation is still in
            progress. It should not be treated as the active planner experience.
          </p>
        </div>

        <div className="planner-placeholder__grid" aria-label="Planner status summary">
          <article className="planner-placeholder__card">
            <p className="planner-placeholder__card-label">Status</p>
            <p className="planner-placeholder__card-value">Compatibility only</p>
            <p className="planner-placeholder__card-copy">Non-indexed placeholder surface retained for transition safety.</p>
          </article>
          <article className="planner-placeholder__card">
            <p className="planner-placeholder__card-label">Canonical Base</p>
            <p className="planner-placeholder__card-value">apps/cad-suite</p>
            <p className="planner-placeholder__card-copy">Live planner work continues in the CAD Suite app boundary.</p>
          </article>
          <article className="planner-placeholder__card">
            <p className="planner-placeholder__card-label">Next Cleanup</p>
            <p className="planner-placeholder__card-value">Route consolidation</p>
            <p className="planner-placeholder__card-copy">This placeholder should eventually be redirected or retired.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
