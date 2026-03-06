"use client";

import { useEffect, useState } from "react";

const QUOTES = [
  "Weedoloveweed 🌿",
  "We're here, we're queer, we're blazed 🔥",
  "Not just a phase — it's a haze 💨",
  "The only closet we're in is the grow room 🌱",
  "Too stoned to be straight 💅",
  "Gay & gassed ✨",
  "Sativa: extrovert weed 🌞",
  "Indica: introvert weed 🛋️",
  "Queer, high & thriving 🌈",
  "She hits different 🌿",
  "Blaze it, sis 💅",
  "Rolling in the deep (couch) 💨",
  "420 but make it gay 🏳️‍🌈",
  "High femme energy ✨",
  "Sapphic & even sappier when high 🌿",
  "Ganja gays assemble 🌈",
  "Weed is my love language 💚",
  "Hybrid? More like bi-brid 🏳️‍🌈",
];

export default function LoginQuote() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1
      className="bg-gradient-to-r from-primary via-sativa to-accent-pink bg-clip-text text-4xl font-extrabold text-transparent transition-opacity duration-400"
      style={{ opacity: visible ? 1 : 0, minHeight: "3rem" }}
    >
      {QUOTES[index]}
    </h1>
  );
}
