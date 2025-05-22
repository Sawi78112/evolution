@echo off
REM Clean the .next directory
rmdir /S /Q .next

REM Run build
npm run build 