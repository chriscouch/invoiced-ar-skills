import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SKILLS_DIR = join(import.meta.dirname, "..", "invoiced-ar-skills");

const SKILL_NAMES = [
  "ar-automation",
  "ar-cash-application",
  "ar-collections-dunning",
  "ar-communication",
  "ar-compliance-controls",
  "ar-credit-risk",
  "ar-cross-functional",
  "ar-dispute-management",
  "ar-erp-proficiency",
  "ar-financial-reporting",
  "ar-invoice-management",
  "ar-metrics-dso",
  "ar-payment-processing",
  "ar-process-optimization",
  "ar-reconciliation",
];

const REQUIRED_SECTIONS = [
  "## When to Use",
  "## Context",
  "## Process",
  "## Output Format",
  "## Guardrails",
  "## Scenarios",
];

const ACTIVE_VERBS = [
  "Analyzes",
  "Assesses",
  "Automates",
  "Calculates",
  "Coordinates",
  "Crafts",
  "Designs",
  "Drafts",
  "Enforces",
  "Ensures",
  "Executes",
  "Generates",
  "Guides",
  "Handles",
  "Investigates",
  "Manages",
  "Maps",
  "Matches",
  "Monitors",
  "Navigates",
  "Operates",
  "Optimizes",
  "Orchestrates",
  "Processes",
  "Produces",
  "Provides",
  "Reconciles",
  "Resolves",
  "Routes",
  "Scores",
  "Structures",
  "Tracks",
  "Validates",
  "Verifies",
];

// --- Helpers ---

function readSkill(name) {
  const path = join(SKILLS_DIR, name, "SKILL.md");
  return readFileSync(path, "utf-8");
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, "File must have YAML frontmatter delimited by ---");
  return match[1];
}

function getProcessSection(content) {
  const match = content.match(/## Process\n([\s\S]*?)(?=\n## )/);
  return match ? match[1] : "";
}

// --- Cross-skill tests ---

describe("Cross-skill validation", () => {
  it("all 15 skill directories exist with SKILL.md", () => {
    for (const name of SKILL_NAMES) {
      const path = join(SKILLS_DIR, name, "SKILL.md");
      assert.ok(existsSync(path), `Missing: ${name}/SKILL.md`);
    }
  });

  it("no v1 remnants (## When AR Platform Tools Are Available)", () => {
    for (const name of SKILL_NAMES) {
      const content = readSkill(name);
      assert.ok(
        !content.includes("## When AR Platform Tools Are Available"),
        `${name} still contains v1 section "## When AR Platform Tools Are Available"`,
      );
    }
  });

  it("all skills have version 2.0", () => {
    for (const name of SKILL_NAMES) {
      const fm = parseFrontmatter(readSkill(name));
      assert.ok(
        fm.includes('version: "2.0"'),
        `${name} does not have version: "2.0"`,
      );
    }
  });
});

// --- Per-skill tests ---

for (const name of SKILL_NAMES) {
  describe(name, () => {
    const content = readSkill(name);
    const lines = content.split("\n");
    const frontmatter = parseFrontmatter(content);

    it("line count is 200–500", () => {
      assert.ok(
        lines.length >= 200 && lines.length <= 500,
        `${lines.length} lines (expected 200–500)`,
      );
    });

    it("frontmatter has version 2.0", () => {
      assert.ok(
        frontmatter.includes('version: "2.0"'),
        'Missing version: "2.0" in frontmatter',
      );
    });

    it("frontmatter description starts with active verb", () => {
      const descMatch = frontmatter.match(
        /description:\s*>\s*\n\s+(.*)/,
      );
      assert.ok(descMatch, "Could not parse description from frontmatter");
      const firstWord = descMatch[1].split(/\s/)[0];
      assert.ok(
        ACTIVE_VERBS.includes(firstWord),
        `Description starts with "${firstWord}", expected one of: ${ACTIVE_VERBS.join(", ")}`,
      );
    });

    it("frontmatter description is under 1024 chars", () => {
      // Extract full multiline description (indented block after description: >)
      const descBlock = frontmatter.match(
        /description:\s*>\s*\n((?:\s{2,}.*\n?)*)/,
      );
      assert.ok(descBlock, "Could not parse description block");
      const desc = descBlock[1].replace(/^\s+/gm, "").trim();
      assert.ok(
        desc.length < 1024,
        `Description is ${desc.length} chars (max 1024)`,
      );
    });

    it("frontmatter has all required YAML keys", () => {
      const requiredKeys = [
        "name:",
        "description:",
        "metadata:",
        "author:",
        "version:",
        "category:",
      ];
      for (const key of requiredKeys) {
        assert.ok(
          frontmatter.includes(key),
          `Missing frontmatter key: ${key}`,
        );
      }
    });

    it("all 6 required sections present", () => {
      for (const section of REQUIRED_SECTIONS) {
        assert.ok(
          content.includes(section),
          `Missing section: ${section}`,
        );
      }
    });

    it("Process section references at least one tool in backticks", () => {
      const process = getProcessSection(content);
      const toolRefs = process.match(/`[a-z_]+`/g);
      assert.ok(
        toolRefs && toolRefs.length > 0,
        "Process section has no backtick-wrapped tool references",
      );
    });

    it("contains [APPROVAL REQUIRED] at least once", () => {
      assert.ok(
        content.includes("[APPROVAL REQUIRED]"),
        "Missing [APPROVAL REQUIRED] gate",
      );
    });

    it("With tools / Without tools pairs are balanced", () => {
      const withCount = (content.match(/\*\*With tools:\*\*/g) || []).length;
      const withoutCount = (content.match(/\*\*Without tools:\*\*/g) || [])
        .length;
      assert.ok(withCount > 0, "No **With tools:** blocks found");
      assert.equal(
        withCount,
        withoutCount,
        `Mismatched pairs: ${withCount} With vs ${withoutCount} Without`,
      );
    });

    it("negative triggers exist and route to 2+ sibling skills", () => {
      assert.ok(
        content.includes("Do NOT use this skill"),
        'Missing "Do NOT use this skill" section',
      );
      const negSection = content.split("Do NOT use this skill")[1];
      const cutoff = negSection.indexOf("\n## ");
      const block = cutoff > -1 ? negSection.slice(0, cutoff) : negSection;
      const refs = block.match(/\*\*ar-[a-z-]+\*\*/g) || [];
      const unique = new Set(refs);
      assert.ok(
        unique.size >= 2,
        `Only ${unique.size} sibling skill references (need 2+)`,
      );
    });
  });
}
