@echo off
echo.
echo  RPCForge GSAP Animations Prompt
echo  ================================
echo.
echo  Copying prompt to clipboard...
type "%~dp0GSAP_ANIMATIONS_PROMPT.md" | clip
echo  [OK] Prompt copied to clipboard!
echo.
echo  Now:
echo  1. Open https://gemini.google.com
echo  2. Paste (Ctrl+V) into the chat
echo  3. Hit Enter
echo.
start https://gemini.google.com
pause
