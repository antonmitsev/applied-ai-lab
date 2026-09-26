---
id: kb-rag-writing-guide-001
title: "RAG-Friendly Documentation Writing Rules"
document_type: requirements
status: draft
version: "0.1"
language: en
---

# RAG-Friendly Documentation Writing Rules

## 1. Write for retrieval, not only for linear reading

The user may receive only one section of a document.

Therefore, the section must be understandable without requiring the previous
section.

Bad:

> As shown above, it presses it.

Good:

> The retaining nut pulls the brass spigot into the valve body; the O-ring is
> the separate element that creates the water seal.

## 2. One term — one clear meaning

At first use, write:

> O-ring (O-пръстен)

After that, the short form may be used.

Do not alternate arbitrarily between “rubber”, “gasket”, “O-ring”, and “seal” when
they refer to different types of parts.

## 3. Name the subject

Avoid vague references such as:

- this;
- that;
- there;
- the above;
- the previous one.

Use:

- the O-ring;
- the brass spigot;
- the retaining nut;
- the cylindrical socket.

## 4. Separate mechanical retention from sealing

For every connection, explicitly answer two different questions:

**What keeps the parts together?**

and

**What stops the water?**

This is key diagnostic knowledge.

## 5. Write causally

Prefer:

> If the O-ring is too thick, additional axial tightening may deform or move
> it. This can increase the leak despite greater tightening.

Instead of:

> Do not tighten it too much.

## 6. Symptoms must be observable

Good symptom:

> The leak drops to zero at an intermediate nut position but appears again at
> maximum tightening.

Weak symptom:

> The fitting is not right.

## 7. Do not invent precision

Do not give invented probabilities:

> It is 80% the O-ring.

Prefer:

> This behavior is more consistent with a problem in the O-ring, socket
> geometry, or misalignment than with a leak through the thread itself.

## 8. Mark uncertainty

Use clear labels:

- Confirmed:;
- Observed:;
- Working hypothesis:;
- Not confirmed:;
- Measurement needed:.

This is especially important in case studies.

## 9. Order diagnostic tests by value

Preferred order:

1. safe;
2. non-destructive;
3. easy;
4. able to distinguish several hypotheses;
5. disassembly or part replacement only afterwards.

Example:

> Dry the connection and observe where water first appears.

Before:

> Replace the entire valve.

## 10. Do not mix universal principles with a specific case

Universal:

> An O-ring is selected according to groove geometry and the required
> compression.

Case-specific:

> In the particular disassembled radiator connection, the groove was measured
> at approximately 17 mm in diameter and 2 mm in width.

## 11. Describe dimensions unambiguously

For O-rings, always clarify what the numbers mean:

- inside diameter;
- outside diameter;
- cord diameter;
- groove diameter;
- groove width.

Do not automatically assume that “17×2” means a commercial 17×2 O-ring.

## 12. Images supplement but do not carry the only knowledge

If there is a diagram or photograph, critical information must also be written
in text.

Bad:

> Install it as shown in the image.

Good:

> The O-ring sits in a peripheral groove on the spigot and enters a cylindrical
> socket in the body.

## 13. Use short diagnostic tables only when helpful

Example:

| Observation | More likely explanation |
|---|---|
| Leak increases at maximum tightening | deformation, over-tightening, misalignment |
| Leak changes when the pipe is moved | side loading / misalignment |
| Leak passes through the thread regardless of position | thread or upstream seal |

The table must not replace the textual explanation.

## 14. Safety writing

When there is risk, the instruction must include a concrete boundary.

Example:

> Before disassembling a radiator connection, the system must be
> depressurized and sufficiently cool.

This is not enough:

> Be careful.

## 15. Language and style

- primary document language: English;
- Bulgarian user terms may be included in aliases and examples;
- technical English terms may be retained where useful;
- short paragraphs;
- clear headings;
- no marketing language;
- no unnecessary warnings in every section;
- no categorical claims when data is incomplete.

## 16. Pre-publication question

For every section, ask:

> If the RAG system returned only this section, would the user understand which
> component, connection, symptom, and causal relationship it describes?

If the answer is “no”, rewrite the section.
