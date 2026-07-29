import Link from "next/link";

/**
 * File 08 is deliberately a server component. Its long-form explanation and
 * evidence links are emitted into the static export as ordinary HTML, even
 * though the interactive investigation above it hydrates on the client.
 */
export function EvidenceCabinet() {
  const evidence = [
    {
      label: "Test files",
      href: "/tests/",
      description:
        "Run focused canvas, WebGL, audio, font, WebRTC, and blocker tests.",
    },
    {
      label: "Fingerprint anatomy",
      href: "/anatomy/fingerprinting/",
      description:
        "Trace how separate browser attributes become one persistent identifier.",
    },
    {
      label: "RTB laboratory",
      href: "/simulation/rtb/",
      description: "Inspect the educational auction model one stage at a time.",
    },
    {
      label: "Methodology",
      href: "/methodology/",
      description:
        "Review entropy priors, valuation assumptions, limitations, and citations.",
    },
    {
      label: "Defense armory",
      href: "/defense/",
      description:
        "Compare practical browser defenses and verify them with repeat tests.",
    },
  ];

  return (
    <section
      id="evidence"
      aria-labelledby="evidence-title"
      className="scroll-mt-20 bg-paper py-16"
    >
      <div className="container mx-auto max-w-4xl px-4">
        <header className="border-b-2 border-ink pb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-300">
            File 08
          </p>
          <h2
            id="evidence-title"
            className="mt-1 font-serif text-3xl font-bold tracking-tight"
          >
            Evidence Cabinet &amp; Field Notes
          </h2>
          <p className="mt-3 max-w-2xl text-ink-200">
            The scanner gives you a momentary result. These records explain what
            it means, where the estimates come from, and how to test a defense
            instead of merely trusting a score.
          </p>
        </header>

        <nav
          aria-label="Evidence cabinet"
          className="border-b border-paper-300 py-6"
        >
          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {evidence.map((item) => (
              <li key={item.href} className="border-l-2 border-ink pl-4">
                <Link
                  href={item.href}
                  className="font-mono text-sm font-bold uppercase tracking-wider underline decoration-highlight decoration-2 underline-offset-4"
                >
                  {item.label}
                </Link>
                <p className="mt-1 text-sm leading-relaxed text-ink-200">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </nav>

        <article className="evidence-notes">
          <h2>
            Your Browser Is a Witness That Never Stops Talking
          </h2>

          <p className="evidence-notes-lead">
            Clearing cookies can remove one kind of identifier, but it does not
            make every browser look the same. A site can still observe the
            language you prefer, the timezone your clock reports, the dimensions
            and pixel density of your display, the graphics features exposed by
            WebGL, the way a canvas image is rendered, and many other details
            needed to make modern web applications work. A browser fingerprint
            is the attempt to combine those ordinary details into a signature.
          </p>

          <p>
            No single field needs to be extraordinary. A common screen size may
            narrow the population only slightly. A common browser version may do
            the same. But the intersection of screen, browser build, operating
            system, fonts, graphics renderer, locale, hardware class, privacy
            settings, and rendering outputs can be much rarer than any
            individual value. That is why the dossier above presents exhibits
            together: the tracking value comes from the combination.
          </p>

          <p>
            Fingerprinting also behaves differently from a cookie. A cookie is a
            value a website writes and later reads. A fingerprint is
            reconstructed from observations. Deleting storage does not
            necessarily change the observations, and private browsing does not
            guarantee that the browser reports a different hardware or rendering
            profile. Some signals change frequently, while others remain stable
            for weeks or months. Trackers can use that mix to recognize a
            returning browser with varying levels of confidence.
          </p>

          <div className="evidence-exhibits">
            <table className="w-full text-left">
              <caption className="mb-3 text-left font-mono text-xs uppercase tracking-widest text-ink-300">
                Common fingerprint exhibits
              </caption>
              <thead>
                <tr className="border-b border-paper-300 font-mono text-xs uppercase tracking-wider">
                  <th className="px-2 py-3">Signal</th>
                  <th className="px-2 py-3">Why it exists</th>
                  <th className="px-2 py-3">Why it can identify</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-300">
                <tr>
                  <td data-label="Signal" className="px-2 py-3 font-bold">
                    Canvas / WebGL
                  </td>
                  <td data-label="Why it exists" className="px-2 py-3">
                    Draw graphics and expose GPU capabilities
                  </td>
                  <td data-label="Why it can identify" className="px-2 py-3">
                    Rendering can vary by GPU, driver, OS, and browser
                  </td>
                </tr>
                <tr>
                  <td data-label="Signal" className="px-2 py-3 font-bold">
                    Fonts
                  </td>
                  <td data-label="Why it exists" className="px-2 py-3">
                    Render documents and application interfaces
                  </td>
                  <td data-label="Why it can identify" className="px-2 py-3">
                    Installed sets reflect software and system history
                  </td>
                </tr>
                <tr>
                  <td data-label="Signal" className="px-2 py-3 font-bold">
                    Screen / hardware
                  </td>
                  <td data-label="Why it exists" className="px-2 py-3">
                    Adapt layout and workload to the device
                  </td>
                  <td data-label="Why it can identify" className="px-2 py-3">
                    The combined device class can be uncommon
                  </td>
                </tr>
                <tr>
                  <td data-label="Signal" className="px-2 py-3 font-bold">
                    Locale / timezone
                  </td>
                  <td data-label="Why it exists" className="px-2 py-3">
                    Format language, dates, and local time
                  </td>
                  <td data-label="Why it can identify" className="px-2 py-3">
                    They narrow geography and user configuration
                  </td>
                </tr>
                <tr>
                  <td data-label="Signal" className="px-2 py-3 font-bold">
                    Privacy signals
                  </td>
                  <td data-label="Why it exists" className="px-2 py-3">
                    Express blocking or preference choices
                  </td>
                  <td data-label="Why it can identify" className="px-2 py-3">
                    Unusual combinations can themselves add distinction
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>
            What the Entropy Number Does—and Does Not—Say
          </h2>

          <p>
            Panopticlick summarizes distinctiveness in bits of entropy. In
            information theory, one bit represents a doubling of the number of
            equally likely possibilities. Roughly speaking, a result with more
            bits would require a larger population before another browser with
            the same modeled profile is expected to appear. The relationship is
            exponential, which is why a small numerical increase can imply a
            much larger anonymity set reduction.
          </p>

          <p>
            The number is an estimate, not a census. This site does not maintain
            a complete live database of every browser on the internet. It
            compares observed attributes with probability assumptions derived
            from fingerprinting research and known distributions, then combines
            them using a documented model. Attributes are not perfectly
            independent, so a model can overstate or understate real-world
            rarity. A laptop model, operating system, screen, and GPU may occur
            together more often than independent multiplication would suggest.
          </p>

          <p>
            Treat the score as a diagnostic comparison: useful for seeing which
            signals contribute most, useful for comparing the same browser
            before and after a change, but not proof that one specific company
            has identified you. Repeatability matters as much as rarity. A
            highly unusual value that changes every page load may be less useful
            to a tracker than a moderately distinctive value that remains
            stable.
          </p>

          <h2>
            The Auction Is a Model, Not a Secret Receipt
          </h2>

          <p>
            On advertising-supported pages, real-time bidding can let
            advertising systems evaluate an impression in a fraction of a
            second. A publisher or its technology partners describe an
            opportunity to show an ad; demand-side platforms compare the
            available context and audience signals with active campaigns;
            eligible buyers return bids; and an exchange chooses an outcome. The
            exact participants, fields, legal basis, and auction design vary
            widely.
          </p>

          <p>
            The auction on this site is educational. It does not contact
            advertisers, place an ad, or observe a live clearing price. The
            valuation engine assigns fictional bidder profiles baseline CPMs and
            adjusts them with modeled device, geography, persona, and
            trackability factors. A small variation makes the display behave
            like an auction rather than a fixed lookup. That is why the result
            should be read as a scenario: “signals like these may change how an
            impression is valued,” not “this is the exact amount a named
            advertiser paid for me.”
          </p>

          <p>
            CPM means cost per thousand impressions. A $5 CPM is therefore half
            a cent per impression before fees and other commercial arrangements.
            It is not the sale price of your identity and it is not money owed
            to you. The annual figure multiplies assumptions about impressions
            over time to make a tiny per-impression value easier to grasp. Real
            prices move with the publisher, campaign goal, location, season,
            available consent, audience demand, fraud controls, ad format, and
            market conditions that this demonstration cannot know.
          </p>

          <aside className="not-prose my-10 border-l-4 border-stamp-blue bg-stamp-blue/5 p-5">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
              Interpretation rule
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-200">
              Use the auction to understand data flow and incentives. Use the
              methodology page to audit the assumptions. Do not use the
              displayed CPM as financial, legal, or market-pricing evidence.
            </p>
          </aside>

          <h2>
            Why “More Random” Is Not Always More Private
          </h2>

          <p>
            Fingerprint defenses generally follow two strategies.
            Standardization makes many browsers report the same value.
            Randomization changes a value so that a stable signature is harder
            to recover. Both can work, and both can fail when applied
            incompletely. If only one obscure attribute is randomized while
            every other signal remains stable, the unusual behavior may make a
            browser stand out. If a protection changes values consistently per
            site, it may prevent cross-site linking while still allowing a site
            to recognize repeat visits.
          </p>

          <p>
            Browser choice matters because the browser controls what websites
            can ask and what answers APIs return. Extensions can block known
            scripts and network requests, but every extension also changes the
            environment and may add detectable behavior. Strict blocking can
            break pages. Permissive settings can preserve compatibility while
            exposing more surface. There is no universal configuration that
            maximizes privacy, anonymity, usability, and compatibility at the
            same time.
          </p>

          <p>
            The most useful defense workflow is experimental. Save the current
            report, change one meaningful setting, restart the browser if
            required, and run the test again. Look for fewer high-entropy
            signals, a larger modeled anonymity set, and more resistance without
            relying on a single headline score. Then test ordinary sites you
            depend on. A defense you immediately disable because it breaks
            essential work is not a durable defense.
          </p>

          <h2>
            A Practical Privacy Baseline
          </h2>

          <ol>
            <li>
              <strong>Keep the browser current.</strong> Security patches matter
              more than chasing a theoretically perfect fingerprint while
              running known vulnerabilities.
            </li>
            <li>
              <strong>Use built-in tracking protection.</strong> Start with the
              browser’s documented privacy controls before stacking extensions
              whose interactions you cannot explain.
            </li>
            <li>
              <strong>Block unnecessary third-party requests.</strong> A
              reputable content blocker reduces contact with many advertising
              and tracking endpoints before they can execute code.
            </li>
            <li>
              <strong>Separate contexts that should not be linked.</strong>{" "}
              Profiles, containers, or purpose-specific browsers can reduce
              accidental joins between work, personal, and sensitive activity.
            </li>
            <li>
              <strong>Express privacy choices.</strong> Global Privacy Control
              can communicate a preference where supported, though a signal is
              not the same as technical blocking.
            </li>
            <li>
              <strong>Retest after changes.</strong> Browser updates,
              extensions, permissions, display changes, and hardware can alter
              the result. A privacy posture is a maintained system, not a
              one-time grade.
            </li>
          </ol>

          <p>
            Network privacy and browser fingerprint privacy are related but
            different. A VPN can change the public IP address visible to a site,
            yet the browser may still expose a recognizable combination of
            rendering and hardware signals. Conversely, a standardized browser
            fingerprint does not hide the IP connection. Evaluate both layers,
            and be skeptical of any product that claims one switch makes you
            anonymous.
          </p>

          <h2 id="frequently-asked-questions">
            Frequently Asked Questions
          </h2>

          <h3>Is my browser fingerprint unique?</h3>
          <p>
            It may be distinctive enough to narrow you to a small modeled group,
            but this test cannot prove global uniqueness. It estimates rarity
            from the signals available in your browser and the probability
            assumptions described in the methodology. The result is most useful
            for comparing configurations and finding the attributes that
            contribute the most identifying information.
          </p>

          <h3>Does Panopticlick store my fingerprint?</h3>
          <p>
            Collection and analysis can run locally. Server storage is optional
            and requires consent in the scan controls. If you decline, the
            report remains on this device so the single-page experience can
            display and reopen it. Privacy controls are available for reviewing
            or deleting data associated with an authorized session.
          </p>

          <h3>What happens during the browser fingerprint test?</h3>
          <p>
            The scanner asks supported browser APIs for hardware, software,
            rendering, capability, and privacy signals. It records which
            collectors finish, builds a local dossier, estimates entropy, runs
            an educational advertising auction model, and scores detectable
            defenses. Unsupported or failed collectors are not silently
            presented as successful evidence.
          </p>

          <div className="not-prose mt-12 border-2 border-highlight bg-highlight/15 p-7 text-center">
            <h3 className="font-serif text-2xl font-bold">
              Treat the report as the start of an investigation
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-ink-200">
              Change one defense, scan again, and compare the evidence—not just
              the grade. Privacy improves when the browser exposes less stable,
              less linkable information.
            </p>
            <a
              href="#scan"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-sm bg-ink px-7 font-mono text-sm font-bold uppercase tracking-wider text-paper transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2"
            >
              Return to the investigation ↑
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
