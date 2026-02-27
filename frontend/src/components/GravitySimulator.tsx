import { useState } from "react";
import { motion } from "framer-motion";
import { Lesson } from "@/data/lessons";

interface GravitySimulatorProps {
  lesson: Lesson;
}

const PLANETS = [
  { name: "Moon", gravity: 0.165, color: "#a8a8a8", emoji: "🌙" },
  { name: "Mars", gravity: 0.378, color: "#c1440e", emoji: "🔴" },
  { name: "Earth", gravity: 1.0, color: "#1a6b9e", emoji: "🌍" },
  { name: "Saturn", gravity: 1.065, color: "#c8a96e", emoji: "🪐" },
  { name: "Jupiter", gravity: 2.528, color: "#c88b3a", emoji: "🟠" },
];

const GravitySimulator = ({ lesson: _lesson }: GravitySimulatorProps) => {
  const [earthWeight, setEarthWeight] = useState(50);
  const [selectedPlanet, setSelectedPlanet] = useState(2); // Earth

  const planet = PLANETS[selectedPlanet];
  const weight = (earthWeight * planet.gravity).toFixed(1);

  const barHeight = Math.min(100, planet.gravity * 40);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="font-space text-xl text-foreground mb-2">Gravity Weight Simulator</h3>
        <p className="text-muted-foreground text-sm">
          See how much you'd weigh on different worlds!
        </p>
      </div>

      {/* Weight input */}
      <div className="glass-card rounded-2xl p-6">
        <label className="block text-sm font-medium text-muted-foreground mb-3">
          Your weight on Earth (kg)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={10}
            max={150}
            value={earthWeight}
            onChange={(e) => setEarthWeight(Number(e.target.value))}
            className="flex-1 accent-primary h-2 rounded-full"
            aria-label="Earth weight slider"
          />
          <div className="w-20 text-center">
            <span className="font-space text-2xl text-primary">{earthWeight}</span>
            <span className="text-muted-foreground text-sm ml-1">kg</span>
          </div>
        </div>
      </div>

      {/* Planet selector */}
      <div>
        <p className="text-sm text-muted-foreground mb-3 text-center">Choose a planet:</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {PLANETS.map((p, i) => (
            <motion.button
              key={p.name}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPlanet(i)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200"
              style={{
                background: selectedPlanet === i ? `${p.color}25` : `hsl(var(--muted))`,
                border: `2px solid ${selectedPlanet === i ? p.color : "transparent"}`,
                boxShadow: selectedPlanet === i ? `0 0 16px ${p.color}50` : "none",
              }}
              aria-pressed={selectedPlanet === i}
              aria-label={`Select ${p.name}`}
            >
              <span className="text-2xl">{p.emoji}</span>
              <span className="text-xs font-medium text-foreground">{p.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Result display */}
      <motion.div
        key={`${selectedPlanet}-${earthWeight}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="glass-card rounded-2xl p-6 text-center relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: `radial-gradient(circle at 50% 100%, ${planet.color}, transparent 70%)` }}
        />
        <div className="relative z-10">
          <div className="text-6xl mb-3" style={{ filter: `drop-shadow(0 0 20px ${planet.color})` }}>
            {planet.emoji}
          </div>
          <p className="text-muted-foreground text-sm mb-1">On {planet.name}, you'd weigh</p>
          <div className="flex items-end justify-center gap-2">
            <span className="font-space text-5xl" style={{ color: planet.color }}>{weight}</span>
            <span className="text-muted-foreground text-lg mb-1">kg</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Gravity is <strong style={{ color: planet.color }}>{planet.gravity}×</strong> {planet.gravity < 1 ? "weaker than" : planet.gravity > 1 ? "stronger than" : "the same as"} Earth
          </p>
        </div>
      </motion.div>

      {/* Bar chart comparison */}
      <div className="glass-card rounded-2xl p-6">
        <p className="text-xs text-muted-foreground mb-4 text-center">Gravity comparison (Earth = 1×)</p>
        <div className="flex items-end justify-around gap-2 h-24">
          {PLANETS.map((p, i) => (
            <div key={p.name} className="flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${p.gravity * 40}%` }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                className="w-8 rounded-t-md transition-all duration-300"
                style={{
                  background: selectedPlanet === i ? p.color : `${p.color}60`,
                  minHeight: 4,
                  height: `${Math.min(100, p.gravity * 40)}%`,
                  boxShadow: selectedPlanet === i ? `0 0 12px ${p.color}80` : "none",
                }}
              />
              <span className="text-xs text-muted-foreground">{p.emoji}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GravitySimulator;
