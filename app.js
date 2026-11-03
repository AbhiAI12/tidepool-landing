/* Pure helpers (exported for Node tests) + small DOM wiring. */
(function (root) {
  "use strict";

  function validateDemoForm(v) {
    var errors = {};
    var name = (v.name || "").trim();
    var email = (v.email || "").trim();
    var topic = (v.topic || "").trim();
    if (!name) errors.name = "Enter your name.";
    if (!email) errors.email = "Enter your work email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Enter an email like name@company.com.";
    if (!topic) errors.topic = "Tell us what you want to teach.";
    else if (topic.length > 500) errors.topic = "Keep this under 500 characters.";
    return errors;
  }

  // Simulated lab: the learner's template is "bad" on first run to show a failing check.
  function runChecks(template) {
    return [
      { label: "storage account exists", pass: template.storageAccount === true },
      { label: "public access is off", pass: template.publicAccess === false }
    ];
  }

  var api = { validateDemoForm: validateDemoForm, runChecks: runChecks };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Tidepool = api;
  if (typeof document === "undefined") return;

  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var attempt = 0;

  function setupLab() {
    var btn = document.getElementById("lab-start");
    var list = document.getElementById("lab-steps");
    var result = document.getElementById("lab-result");
    if (!btn) return;
    var items = Array.prototype.slice.call(list.children);
    var delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650;

    btn.addEventListener("click", async function () {
      btn.disabled = true;
      attempt += 1;
      result.textContent = "";
      items.forEach(function (li) { li.dataset.state = "idle"; });
      // First run uses a misconfigured template so learners see a failing check; later runs pass.
      var checks = runChecks({ storageAccount: true, publicAccess: attempt > 1 });
      for (var i = 0; i < items.length; i++) {
        items[i].dataset.state = "running";
        await sleep(delay);
        var st = i < 2 ? "pass" : (checks[i - 2].pass ? "pass" : "fail");
        items[i].dataset.state = st;
      }
      var failed = checks.some(function (c) { return !c.pass; });
      result.textContent = failed
        ? "Public access is still on. Fix the template and run the lab again."
        : "All checks passed. Sandbox will be deleted.";
      btn.textContent = failed ? "Run again with the fix" : "Run again";
      btn.disabled = false;
    });
  }

  function setupForm() {
    var form = document.getElementById("demo-form");
    if (!form) return;
    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var values = { name: form.name.value, email: form.email.value, topic: form.topic.value };
      var errors = validateDemoForm(values);
      ["name", "email", "topic"].forEach(function (k) {
        var field = form.elements[k];
        var msg = document.getElementById(k + "-err");
        msg.textContent = errors[k] || "";
        field.setAttribute("aria-invalid", errors[k] ? "true" : "false");
      });
      var first = Object.keys(errors)[0];
      if (first) { status.textContent = ""; form.elements[first].focus(); return; }
      status.textContent = "Thanks. We will reply within one working day. (Demo form: nothing was sent.)";
      form.reset();
    });
  }

  setupLab();
  setupForm();
})(typeof window !== "undefined" ? window : globalThis);
