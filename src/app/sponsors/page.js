"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, easeOut } from "@/components/MotionPrimitives";
import styles from "./sponsors.module.css";
import layoutStyles from "./sponsors.layout.module.css";
import ElectricBorderCanvas from "@/components/ElectricBorderCanvas";

const sponsorTiers = [
  { id: "title", label: "Title Sponsor", marker: "01", icon: "✦", sponsors: [{ name: "Qpi AI", url: "https://www.qpiai.tech/", logo: "/sponsors/qpiai.png", alt: "Qpi AI logo" }] },
  { id: "gold", label: "Gold Sponsors", marker: "02", icon: "◆", sponsors: [{ name: "IEEE", url: "https://www.ieee.org/", logo: "/sponsors/IEEE.jpeg", alt: "IEEE logo" }, { name: "IES", url: "https://ies.org/", logo: "/sponsors/IES.jpeg", alt: "IES logo" }] },
  { id: "inkind", label: "In-kind Partner", marker: "03", icon: "↗", sponsors: [{ name: "CodeCrafters", url: "https://codecrafters.io/", logo: "/sponsors/codecrafters.png", alt: "CodeCrafters logo" }] },
  { id: "vc", label: "VC Partners", marker: "04", icon: "◎", sponsors: [{ name: "Growth Sense", url: "https://www.growth-sense.com/", logo: "/sponsors/growthsense.png", alt: "Growth Sense logo" }, { name: "Hyderabad Angels", url: "https://hyderabadangels.in/", logo: "/sponsors/hyderabadangels.png", alt: "Hyderabad Angels logo" }] },
  { id: "event", label: "Media Partner", marker: "05", icon: "✦", sponsors: [{ name: "Media Partner", url: "https://eventopia.in", logo: "/sponsors/Eventopia-Logo.png", alt: "Media Partner logo" }] },
  { id: "platform", label: "Platform Sponsor", marker: "06", icon: "↗", sponsors: [{ name: "Bloq", url: "https://www.bloq.in/", logo: "/sponsors/bloq.ico", alt: "Bloq logo" }] },
  { id: "credentials", label: "Credentials Patner", marker: "07", icon: "↗", sponsors: [{ name: "TruScholar", url: "https://truscholar.io", logo: "/sponsors/tru.png", alt: "TruScholar logo" }] },
  { id: "educational", label: "Educational partner", marker: "08", icon: "✦", sponsors: [{ name: "Finlatics", url: "https://finlatics.com", logo: "/sponsors/finlatics.jpeg", alt: "Finlatics logo" }] },
];

function SponsorLogo({ sponsor, priority = false, className = "" }) {
  return <a href={sponsor.url} target="_blank" rel="noopener noreferrer" className={`${styles.logoLink} ${className}`} aria-label={`Visit ${sponsor.name}`}><div className={styles.logoSurface}><Image src={sponsor.logo} alt={sponsor.alt} width={240} height={112} priority={priority} unoptimized={sponsor.unoptimized} className={styles.logo} /></div><span className={styles.companyName}>{sponsor.name}</span>{sponsor.role && <span className={layoutStyles.platformSponsor}>{sponsor.role}</span>}</a>;
}

function SponsorTier({ tier, index }) {
  const cardRef = useRef(null);
  const isTitleSponsor = tier.id === "title";

  return <motion.article ref={cardRef} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.16 }} whileHover={{ y: -4 }} transition={{ duration: 0.45, delay: index * 0.06, ease: easeOut }} className={`${styles.tierCard} ${styles[tier.id] || ""} ${isTitleSponsor ? layoutStyles.electricTitle : ""} ${tier.id === "inkind" ? layoutStyles.inkind : ""} ${tier.id === "vc" ? layoutStyles.vc : ""} ${tier.id === "event" ? layoutStyles.event : ""}`}>
    {isTitleSponsor && <div className={layoutStyles.electricTreatment} aria-hidden="true"><div className={layoutStyles.electricInner}><ElectricBorderCanvas containerRef={cardRef} canvasId="title-sponsor-electric-border" color="#E8E8E8" borderRadius={24} borderOffset={52} canvasPadding={52} displacement={60} speed={1.5} lineWidth={1} /><div className={layoutStyles.glowLayerOne} /><div className={layoutStyles.glowLayerTwo} /></div><div className={layoutStyles.overlayOne} /><div className={layoutStyles.overlayTwo} /><div className={layoutStyles.backgroundGlow} /></div>}
    <div className={styles.tierHeading}><span className={styles.tierNumber}>{tier.marker}</span><span className={styles.tierIcon} aria-hidden="true">{tier.icon}</span><h2>{tier.label}</h2></div><div className={`${styles.sponsorList} ${tier.id === "inkind" ? layoutStyles.inkindList : ""} ${tier.id === "platform" ? layoutStyles.platformList : ""} ${tier.id === "vc" ? layoutStyles.vcList : ""} ${tier.id === "event" ? layoutStyles.eventList : ""}`}>{tier.sponsors.map((sponsor) => <SponsorLogo key={sponsor.id || sponsor.name} sponsor={sponsor} priority={isTitleSponsor} className={tier.id === "credentials" ? layoutStyles.credentialsLogo : tier.id === "educational" ? layoutStyles.educationalLogo : tier.id === "platform" ? layoutStyles.platformLogo : tier.id === "vc" ? layoutStyles.vcLogo : tier.id === "event" ? layoutStyles.eventLogo : ""} />)}</div>
  </motion.article>;
}

export default function SponsorsPage() {
  const [additionalSponsors, setAdditionalSponsors] = useState([]);

  useEffect(() => {
    let active = true;
    fetch("/api/sponsors", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not load added sponsors.");
        if (!Array.isArray(body.sponsors)) throw new Error("The sponsors response was invalid.");
        return body.sponsors;
      })
      .then((sponsors) => {
        if (active) setAdditionalSponsors(sponsors);
      })
      .catch((error) => {
        console.error("Could not load added sponsors:", error);
      });
    return () => {
      active = false;
    };
  }, []);

  const tiersWithAdditionalSponsors = sponsorTiers.map((tier) => ({
    ...tier,
    sponsors: [
      ...tier.sponsors,
      ...additionalSponsors
        .filter((sponsor) => sponsor.tier_id === tier.id)
        .map((sponsor) => ({
          id: sponsor.id,
          name: sponsor.name,
          url: sponsor.url,
          logo: sponsor.logo_url,
          alt: `${sponsor.name} logo`,
          unoptimized: true,
        })),
    ],
  }));

  return <section id="sponsors" className={styles.section} aria-labelledby="sponsors-heading"><div className={styles.orbit} aria-hidden="true" /><div className={styles.gridTexture} aria-hidden="true" /><div className={styles.content}><Reveal className={styles.intro}><p className={styles.eyebrow}><span /> Quant-A-Maze 3.0 · Partner Network</p><h1 id="sponsors-heading">Built with the<br /><em>right partners.</em></h1><p className={styles.lede}>We&apos;re grateful to the organizations helping bring India&apos;s student quantum community together.</p></Reveal><div className={styles.tierGrid}>{tiersWithAdditionalSponsors.map((tier, index) => <SponsorTier key={tier.id} tier={tier} index={index} />)}</div><Reveal delay={0.12}><aside className={styles.cta} aria-labelledby="sponsor-opportunity-heading"><div><p className={styles.ctaKicker}>Partner with Quant-A-Maze</p><h2 id="sponsor-opportunity-heading">Put your brand at the frontier of quantum innovation.</h2><p>Connect with exceptional student builders, researchers, and developers from across India.</p></div><Link href="#footer" className={styles.ctaLink}>Start a conversation <span aria-hidden="true">→</span></Link></aside></Reveal></div></section>;
}
