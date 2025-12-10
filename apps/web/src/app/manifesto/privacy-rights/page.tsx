import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Document,
  DocumentHeader,
  DocumentSection,
  Stamp,
} from '@/components/ui';

export const metadata: Metadata = {
  title: 'Digital Privacy Rights Declaration | Panopticlick',
  description:
    'A declaration of digital privacy rights for the internet age. Privacy is not a feature—it\'s a fundamental human right. Read our manifesto on data sovereignty and digital freedom.',
  openGraph: {
    title: 'Digital Privacy Rights: A Declaration for the Internet Age',
    description:
      'Privacy is a human right. A manifesto for data sovereignty and digital freedom.',
    type: 'article',
  },
};

export default function PrivacyRightsPage() {
  return (
    <div className="bg-paper grid-bg">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Document variant="classified" watermark="DECLARATION">
          <DocumentHeader
            title="Digital Privacy Rights"
            subtitle="A Declaration for the Internet Age"
            classification="unclassified"
            date={new Date()}
          />

          <nav className="mb-8 p-4 bg-paper-100 rounded-sm">
            <span className="text-xs font-mono text-ink-300 uppercase tracking-wider">
              Navigate:{' '}
            </span>
            <Link href="/manifesto/" className="text-sm hover:underline">
              Manifesto
            </Link>
            <span className="text-ink-300 mx-2">→</span>
            <span className="text-sm font-bold">Privacy Rights</span>
          </nav>

          <article className="prose prose-lg max-w-none">
            <DocumentSection title="Preamble">
              <p className="font-serif text-xl leading-relaxed">
                We hold these truths to be self-evident in the digital age: that all internet
                users are endowed with certain unalienable rights, and that among these are
                <strong> privacy</strong>, <strong>data sovereignty</strong>, and the
                <strong> freedom from surveillance</strong>.
              </p>
              <p>
                The internet was built as a tool for human communication and liberation.
                Over the past two decades, it has been transformed into a surveillance apparatus
                that commodifies human behavior on an unprecedented scale. This transformation
                was not inevitable—it was a choice made by corporations and enabled by our
                collective inaction.
              </p>
              <p>
                It's time to choose differently.
              </p>
            </DocumentSection>

            <DocumentSection title="Article I: The Right to Anonymity">
              <blockquote className="border-l-4 border-highlight pl-4 my-6">
                Every person has the right to browse, communicate, and transact online
                without being identified, tracked, or profiled.
              </blockquote>
              <p>
                <strong>Anonymity is not suspicious.</strong> Throughout human history, anonymous
                speech has been essential for political dissent, whistleblowing, and personal
                exploration. The Federalist Papers were published anonymously. So were countless
                works of literature, philosophy, and journalism that shaped our world.
              </p>
              <p>
                The default state of browsing the web should be anonymous. Identification should
                be explicit, consensual, and purposeful—not the baseline assumption.
              </p>
              <div className="bg-paper-100 p-4 rounded-sm my-6">
                <h4 className="font-mono text-sm font-bold mb-2">In Practice</h4>
                <ul className="text-sm text-ink-200">
                  <li>Websites should not require login to browse public content</li>
                  <li>Fingerprinting without consent should be illegal</li>
                  <li>Cross-site tracking should be opt-in, never opt-out</li>
                  <li>Users should be able to use services without creating "accounts"</li>
                </ul>
              </div>
            </DocumentSection>

            <DocumentSection title="Article II: The Right to Data Sovereignty">
              <blockquote className="border-l-4 border-highlight pl-4 my-6">
                Every person owns their personal data. No entity may collect, store, process,
                or sell personal data without explicit, informed, and revocable consent.
              </blockquote>
              <p>
                <strong>Your data is yours.</strong> It's not a "resource" for companies to
                extract. It's not a "byproduct" of using services. It's an extension of your
                identity, and you have the absolute right to control it.
              </p>
              <p>
                "Consent" buried in 50-page terms of service is not consent. "Accept all cookies"
                as the default option is not consent. True consent means:
              </p>
              <ul>
                <li>Clear, plain-language explanation of what data is collected</li>
                <li>Specific purposes for each data type</li>
                <li>Equal ease of accepting or declining</li>
                <li>Revocation at any time with immediate effect</li>
                <li>No penalty for declining (service works without data collection)</li>
              </ul>
            </DocumentSection>

            <DocumentSection title="Article III: The Right to Know">
              <blockquote className="border-l-4 border-highlight pl-4 my-6">
                Every person has the right to know what data is collected about them, who
                has access to it, how it is used, and where it is sold.
              </blockquote>
              <p>
                <strong>Transparency is non-negotiable.</strong> If a company collects data
                about you, you have the right to:
              </p>
              <ul>
                <li>Access the complete record of your data</li>
                <li>Know every entity that has received your data</li>
                <li>Understand the inferences made about you</li>
                <li>Challenge and correct inaccuracies</li>
                <li>Request complete deletion</li>
              </ul>
              <p>
                The surveillance economy thrives in darkness. Data brokers operate in shadows,
                building profiles from hundreds of sources. This must end. Every person
                deserves to know their "shadow profile."
              </p>
            </DocumentSection>

            <DocumentSection title="Article IV: The Right to Be Forgotten">
              <blockquote className="border-l-4 border-highlight pl-4 my-6">
                Every person has the right to request the permanent deletion of their personal
                data from any system that holds it.
              </blockquote>
              <p>
                <strong>The past should not haunt forever.</strong> People change. Circumstances
                change. Information that was once public may become harmful. The ability to
                start fresh is fundamental to human dignity.
              </p>
              <p>
                Deletion means deletion—not archiving, not flagging as "inactive," not
                keeping "for legal purposes." When you request deletion, every copy of your
                data should be purged from every system.
              </p>
              <div className="bg-alert-red/10 p-4 rounded-sm border-l-4 border-alert-red my-6">
                <h4 className="font-mono text-sm font-bold mb-2">Current Reality</h4>
                <p className="text-sm text-ink-200">
                  Data brokers like Acxiom and Oracle maintain profiles on billions of people.
                  Most have no opt-out mechanism, or make it intentionally difficult. Some
                  sell your data before you can even request deletion.
                </p>
              </div>
            </DocumentSection>

            <DocumentSection title="Article V: The Right to Security">
              <blockquote className="border-l-4 border-highlight pl-4 my-6">
                Every person has the right to have their personal data protected with
                state-of-the-art security measures.
              </blockquote>
              <p>
                <strong>If you collect data, you must protect it.</strong> Data breaches are
                not acceptable costs of doing business. They are failures of responsibility.
                Companies that cannot secure data should not collect it.
              </p>
              <ul>
                <li>Encryption at rest and in transit should be mandatory</li>
                <li>Data minimization: only collect what's necessary</li>
                <li>Regular security audits and penetration testing</li>
                <li>Immediate breach notification (hours, not months)</li>
                <li>Meaningful penalties for negligence</li>
              </ul>
            </DocumentSection>

            <DocumentSection title="Article VI: The Right to Encryption">
              <blockquote className="border-l-4 border-highlight pl-4 my-6">
                Every person has the right to use strong encryption without backdoors,
                and to communicate privately without government or corporate surveillance.
              </blockquote>
              <p>
                <strong>Encryption is not a crime.</strong> End-to-end encryption is the
                digital equivalent of a sealed envelope. Governments that demand "backdoors"
                for law enforcement are demanding the abolition of private communication.
              </p>
              <p>
                There is no such thing as a backdoor that only "good guys" can use. Every
                vulnerability created for law enforcement is a vulnerability for criminals,
                foreign adversaries, and oppressive regimes.
              </p>
            </DocumentSection>

            <DocumentSection title="Article VII: The Right to Fair Algorithms">
              <blockquote className="border-l-4 border-highlight pl-4 my-6">
                Every person has the right to understand and challenge algorithmic decisions
                that affect their lives.
              </blockquote>
              <p>
                <strong>Algorithms are not neutral.</strong> They encode the biases of their
                creators and the data they're trained on. When algorithms determine credit
                scores, job opportunities, insurance rates, or criminal sentencing, people
                deserve to know how and why.
              </p>
              <ul>
                <li>Right to know when an algorithm is making decisions about you</li>
                <li>Right to a human review of significant algorithmic decisions</li>
                <li>Right to explanation of algorithmic logic</li>
                <li>Right to contest and appeal algorithmic decisions</li>
              </ul>
            </DocumentSection>

            <DocumentSection title="Call to Action">
              <p className="font-serif text-xl leading-relaxed">
                These rights will not be granted—they must be demanded. Change requires action
                at every level:
              </p>

              <div className="grid md:grid-cols-2 gap-4 not-prose my-8">
                <div className="bg-paper-100 p-5 rounded-sm">
                  <h4 className="font-mono text-sm font-bold mb-3 uppercase tracking-wider">
                    Individual Actions
                  </h4>
                  <ul className="text-sm text-ink-200 space-y-2">
                    <li>• Use privacy-respecting tools and browsers</li>
                    <li>• Opt out of tracking when possible</li>
                    <li>• Support companies with ethical data practices</li>
                    <li>• Educate friends and family</li>
                    <li>• Delete accounts you don't need</li>
                  </ul>
                </div>
                <div className="bg-paper-100 p-5 rounded-sm">
                  <h4 className="font-mono text-sm font-bold mb-3 uppercase tracking-wider">
                    Collective Actions
                  </h4>
                  <ul className="text-sm text-ink-200 space-y-2">
                    <li>• Support privacy legislation</li>
                    <li>• Donate to digital rights organizations</li>
                    <li>• Vote for candidates who prioritize privacy</li>
                    <li>• Demand corporate accountability</li>
                    <li>• Build and contribute to open-source tools</li>
                  </ul>
                </div>
              </div>

              <div className="bg-ink text-paper p-6 rounded-sm my-8">
                <p className="font-serif text-lg leading-relaxed">
                  The surveillance economy is not inevitable. It is a system built by humans,
                  sustained by our participation, and it can be dismantled by our collective
                  action. The choice is ours.
                </p>
                <p className="font-mono text-sm mt-4 text-paper-300">
                  Privacy is not dead. It's fighting for its life. Join the fight.
                </p>
              </div>
            </DocumentSection>

            <DocumentSection title="Supporting Organizations">
              <p className="text-ink-200 mb-4">
                These organizations are leading the fight for digital rights:
              </p>
              <div className="grid md:grid-cols-2 gap-4 not-prose">
                <a
                  href="https://www.eff.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-paper-100 p-4 rounded-sm hover:shadow-md transition-shadow"
                >
                  <h5 className="font-mono text-sm font-bold mb-1">Electronic Frontier Foundation</h5>
                  <p className="text-xs text-ink-200">Digital civil liberties organization</p>
                </a>
                <a
                  href="https://www.accessnow.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-paper-100 p-4 rounded-sm hover:shadow-md transition-shadow"
                >
                  <h5 className="font-mono text-sm font-bold mb-1">Access Now</h5>
                  <p className="text-xs text-ink-200">Global digital rights advocacy</p>
                </a>
                <a
                  href="https://www.privacyinternational.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-paper-100 p-4 rounded-sm hover:shadow-md transition-shadow"
                >
                  <h5 className="font-mono text-sm font-bold mb-1">Privacy International</h5>
                  <p className="text-xs text-ink-200">Fighting surveillance worldwide</p>
                </a>
                <a
                  href="https://epic.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-paper-100 p-4 rounded-sm hover:shadow-md transition-shadow"
                >
                  <h5 className="font-mono text-sm font-bold mb-1">EPIC</h5>
                  <p className="text-xs text-ink-200">Electronic Privacy Information Center</p>
                </a>
              </div>
            </DocumentSection>
          </article>

          <div className="mt-8 pt-8 border-t border-paper-300">
            <div className="flex justify-between items-center">
              <Link
                href="/manifesto/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                ← Back to Manifesto
              </Link>
              <Link
                href="/defense/"
                className="inline-flex items-center gap-2 text-sm font-mono hover:underline"
              >
                Take Action: Defense Tools →
              </Link>
            </div>
          </div>
        </Document>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="verified">Declaration</Stamp>
          <Stamp variant="protected">Digital Rights</Stamp>
        </div>
      </div>
    </div>
  );
}
