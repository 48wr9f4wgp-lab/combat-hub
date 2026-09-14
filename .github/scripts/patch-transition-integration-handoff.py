from pathlib import Path

p=Path('HANDOFF.md')
s=p.read_text()
repls={
"- Runtime PR: **#45 — Ring official-events parser**":"- Latest runtime-changing PR: **#56 — harden multi-event transition timeline**",
"- Runtime merge commit: `cb6358396a5493b98f1a7c486d17fba957aa92a4`":"- Runtime merge commit: `d9d44577e60861893694b5e1ee4a5a10aee9233b`",
"- Main Regression after PR #45: **#486 success**":"- Main Regression after runtime PR #56: **#595 success**",
"- event transition behavior\n":"- event transition behavior\n- deterministic five-series transition timeline QA\n- end-to-end `loadData()` / `loadLargeNext()` transition integration with shared-cache simulation\n",
"## 10. Immediate next task — one minimal v7.14.0 device check":"## 10. Historical v7.14.0 device-check note",
"## 11. Known debt / risks":"## 10A. Current QA status / next empirical checks\n\nAutomated transition coverage now exercises all five organizations through sequential current/next promotion, including BOXING manual-prefetch -> verified-cache-only Widget behavior and K-1 date-only/time-TBA rollover.\n\nNo additional visual churn or repeated five-organization screenshot loop is required for this logic-only pass. The remaining useful real-device checks are event-driven:\n\n- observe the next real organization rollover after an event completes and confirm the expected current/next pair appears without manual cache surgery\n- when Ring `/events` publishes a genuine future BOXING event, run BOXING manually once and confirm the verified event is then consumed by the home-screen Widget without blanking\n- investigate only if runtime audit fields, event identity, countdown, or display state diverge from the official source\n\n## 11. Known debt / risks",
}
for old,new in repls.items():
    if old not in s:
        raise SystemExit(f'missing HANDOFF target: {old}')
    s=s.replace(old,new,1)
p.write_text(s)
