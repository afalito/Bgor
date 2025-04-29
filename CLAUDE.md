# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Run Commands
- Open index.html in a browser to view the website
- No build tools are required as this is a static HTML/CSS/JS website

## Code Style Guidelines
- HTML: Use semantic elements, maintain proper indentation with 4 spaces
- CSS: 
  - Follow BEM naming convention when possible
  - Use CSS variables for consistent colors and styling
  - Keep styles organized in separate files (styles.css, animations.css, improvements.css)
- JavaScript:
  - Use event delegation when appropriate
  - Always check if elements exist before working with them
  - Follow the existing pattern of DOMContentLoaded event listeners
  - Use let/const instead of var
  - Add error handling for DOM manipulations

## Naming Conventions
- Use descriptive class names that reflect component purpose
- CSS classes use kebab-case (e.g., .hero-content, .product-card)
- JavaScript variables use camelCase (e.g., navMenu, testimonialSlider)
- Use semantic HTML5 elements (section, nav, header, footer) appropriately

## File Organization
- Keep HTML, CSS, and JS in their respective directories
- Images belong in the images/ directory
- Maintain separation of concerns across files