SpeedReader: A High-Precision RSVP Reading Tool
SpeedReader is a web-based application designed for high-velocity, distraction-free reading. Built with React and Next.js, the tool leverages Rapid Serial Visual Presentation (RSVP) and Optimal Recognition Point (ORP) highlighting to enable users to process text at speeds of up to 1000 Words Per Minute (WPM).

By centering a single "focus" character in a monospaced layout, the app minimizes saccadic eye movements, allowing the brain to process information faster and with less fatigue.

🚀 Key Features
Adaptive WPM Control: Granular speed adjustment ranging from casual reading to extreme high-speed processing (up to 1000 WPM).

Optimal Recognition Point (ORP): A 3-span display logic (Prefix-Focus-Suffix) that keeps the red "focus letter" perfectly centered, guiding the eye's natural focal point.

Intelligent Punctuation Pausing: Built-in logic to add slight delays on commas, periods, and semi-colons, mimicking natural reading cadence and improving comprehension.

High-Precision Timing: Utilizes requestAnimationFrame and performance.now() to ensure frame-perfect word delivery without lag or stuttering.

Progress Tracking: Real-time progress bar to visualize how much content remains in the session.

🛠️ Technical Stack
Frontend Framework: Next.js (React)

State Management: React Hooks (useState, useEffect, useRef)

Timing Engine: Web Performance API (requestAnimationFrame) for jitter-free rendering.

Styling: Tailwind CSS for a minimalist, "Dark Mode" focused UI.

Typography: Monospaced fonts to ensure consistent character spacing and ORP alignment.

📖 How it Works
The app implements a specialized algorithm to split and display text:

Text Tokenization: Input text is sanitized and split into individual word arrays.

Focus Point Calculation: For every word, the algorithm identifies the optimal focal character based on word length:

Short words (1-5 chars): 2nd character.

Medium words (6-9 chars): 3rd character.

Long words (10+ chars): 4th character.
