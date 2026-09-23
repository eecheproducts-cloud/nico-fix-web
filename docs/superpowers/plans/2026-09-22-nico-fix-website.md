# Nico Fix Website Implementation Plan

Este documento es el plan de implementacion completo (8 tareas) que se uso para construir el sitio, incluyendo la spec de Notion referenciada, las restricciones globales y las decisiones tomadas durante la revision final.

Ver el archivo completo en el repositorio local o en la carpeta docs/superpowers/plans/ para el detalle tarea por tarea. Resumen:

- Goal: sitio de una pagina, bilingue EN/ES, para Nico Fix (handyman independiente en Rotterdam-Schiedam)
- Stack: HTML/CSS/JS vanilla, sin build step, Node test runner para 9 tests unitarios
- Spec: https://app.notion.com/p/3e3434fafea78190a9c0ccaaa07456f7
- Lista de 30 servicios: final, sacada de la base "Checklist de Servicios" en Notion (2026-09-22)
- Revision final aplico 9 correcciones: fallback de contacto (WhatsApp + email), traduccion del selector de tipo de trabajo, carga de tipografias de marca, agrupacion visual de servicios por categoria, proteccion contra doble envio del formulario, fallback si falla localStorage, link de WhatsApp hardcodeado sin JS, titulo/aria-label traducidos, y .gitignore.

Pendiente antes de publicar: numero real de WhatsApp, email de contacto, webhook de n8n para el formulario, numero de KVK, fotos reales de la renovacion de Schiedam, dominio propio.
