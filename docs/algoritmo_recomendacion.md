# Algoritmo de Recomendación de Rutinas

## Descripción general

El sistema incorpora un algoritmo de recomendación de rutinas diseñado específicamente para el colectivo de supervivientes pediátricos de cáncer. A diferencia de los sistemas de recomendación colaborativos clásicos —que requieren grandes volúmenes de datos de múltiples usuarios—, el algoritmo desarrollado es **basado en contenido y centrado en el usuario individual**: opera exclusivamente con el historial de sesiones del propio paciente, sus métricas de bienestar subjetivo y su perfil clínico. Esta decisión de diseño responde a dos restricciones propias del dominio: la escasa cantidad de usuarios simultáneos en un contexto clínico y la necesidad de garantizar recomendaciones seguras y personalizadas desde la primera sesión.

El algoritmo se implementa en el método `recommendRoutine()` de `RoutineService` ([routine.service.ts](file:///home/jpliesa/Documentos/tfg/backend/src/services/routine.service.ts)) y se articula en cuatro fases secuenciales:

---

## Fase 1 — Filtrado por disponibilidad de material

En primer lugar, el sistema recopila el catálogo de rutinas visibles para el usuario: aquellas de carácter genérico (sin usuario asignado) y las personalizadas creadas específicamente para él por su supervisor clínico.

A continuación, aplica un **filtro duro** según si el paciente dispone de material de ejercicio en el momento de la sesión (parámetro `hasEquipment`). Las rutinas que requieren equipamiento son separadas de las que se realizan únicamente con el peso corporal. Si tras aplicar este filtro no queda ninguna rutina candidata, el sistema activa un **mecanismo de fallback** y considera todas las rutinas disponibles, garantizando así que siempre se produce una recomendación. Cuando el fallback está activo, se marca internamente para inhibir la bonificación por coincidencia de material en la fase de puntuación.

---

## Fase 2 — Ajuste de dificultad objetivo

El algoritmo determina cuál es la dificultad más adecuada para la próxima sesión consultando dos fuentes de información de la sesión anterior:

**a) Métricas subjetivas de bienestar (WellnessTest inicial)**

Antes de cada sesión, el usuario completa un test de bienestar breve en el que puntúa del 1 al 5 su nivel de dolor, fatiga, somnolencia y ánimo. El sistema consulta este test inicial de la sesión más reciente y aplica las siguientes reglas:

- Si el **dolor ≥ 4** o la **fatiga ≥ 4**, se interpreta que el paciente se encuentra en un estado de malestar significativo y se baja un nivel de dificultad.
- Si el **dolor ≤ 2** y la **fatiga ≤ 2**, el paciente se encuentra en buenas condiciones y se considera la posibilidad de subir un nivel (condicionado también al ratio de compleción).
- En cualquier otro caso intermedio, se mantiene el nivel actual.

**b) Ratio de compleción de la sesión anterior**

El sistema calcula qué porcentaje de las repeticiones planificadas llegó a completar el usuario en su última sesión, comparando las repeticiones realmente realizadas (`Execute.numRepsDone`) con las prescritas por el plan de la rutina (`Plan.numReps × Plan.numSeries`). Si el usuario realizó varios ejercicios, se promedia el ratio de todos ellos:

$$\text{completionRatio} = \frac{1}{n} \sum_{i=1}^{n} \min\!\left(\frac{\text{numRepsDone}_i}{\text{numReps}_i \times \text{numSeries}_i},\ 1\right)$$

Las reglas de ajuste que aplica el ratio de compleción son:
- **< 60%** → se baja un nivel de dificultad (la rutina fue demasiado exigente).
- **> 90%** (junto con dolor y fatiga bajos) → se sube un nivel (la rutina fue demasiado fácil).
- **Entre 60% y 90%** → se mantiene el nivel actual.

El sistema contempla además dos condiciones límite: nunca se puede bajar del nivel `EASY` ni superar el nivel `HARD`.

> **Sin historial previo:** si el usuario aún no ha completado ninguna sesión, el sistema asigna directamente el nivel de dificultad `EASY` como punto de partida conservador.

---

## Fase 3 — Puntuación y selección (función `scoreRoutine`)

El núcleo del algoritmo es una **función de puntuación pura** —sin dependencias de base de datos— que evalúa cada rutina candidata asignándole una puntuación total a partir de cuatro componentes independientes:

| Componente | Condición | Puntos |
|---|---|---|
| **Coincidencia de dificultad** | La dificultad de la rutina coincide exactamente con la dificultad objetivo | +4 |
| **Dificultad adyacente** | La dificultad de la rutina dista un nivel de la objetivo | +2 |
| **Rotación de categoría** | La categoría de la rutina es distinta a la de la última sesión | +2 |
| **Coincidencia de material** | La rutina coincide con la disponibilidad de material declarada (si no hay fallback activo) | +1 |
| **Penalización por repetición** | La rutina aparece N veces en las últimas 5 sesiones | −3 × N |

La función de puntuación total queda definida como:

$$\text{score}(r, c) = D(r,c) + R(r,c) + E(r,c) + P(r,c)$$

Donde:
- $D(r,c)$ es la puntuación por coincidencia de dificultad (0, 2 ó 4 según la distancia en el orden `EASY → MEDIUM → HARD`).
- $R(r,c)$ es la bonificación por rotación de categoría (0 ó 2).
- $E(r,c)$ es la bonificación por coincidencia de material (0 ó 1).
- $P(r,c)$ es la penalización por repetición reciente (−3 × número de apariciones, valor ≤ 0).

La penalización por repetición tiene como efecto que una rutina ejecutada varias sesiones consecutivas acabe obteniendo una puntuación inferior a una rutina nueva aunque coincida mejor en dificultad. Esto promueve la variedad del entrenamiento, que resulta especialmente beneficiosa para este colectivo.

El sistema selecciona la rutina con mayor puntuación total. En caso de **empate**, la elección entre los candidatos empatados se realiza de forma aleatoria, evitando que el mismo desempate determinista favorezca siempre a la misma rutina.

### Pseudocódigo

```
FUNCIÓN recommendRoutine(userId, hasEquipment):
    rutinas ← obtenerRutinasPorUsuario(userId)
    SI rutinas vacías → lanzar NotFoundException

    candidatos ← rutinas WHERE usesEquipment = hasEquipment
    SI candidatos vacío:
        candidatos ← rutinas (fallback)
        fallbackActivo ← verdadero

    sesionesRecientes ← últimas 5 sesiones completadas del usuario
    ultimaSesion ← sesionesRecientes[0]  // la más reciente
    targetDificultad ← calcularDificultadObjetivo(userId, ultimaSesion)

    conteoReciente ← Map { nombre_rutina → nº apariciones en sesionesRecientes }
    contexto ← { targetDificultad, ultimaCategoria, hasEquipment, fallbackActivo, conteoReciente }

    mejorPuntuacion ← -∞
    mejoresCandidatos ← []

    PARA CADA candidato EN candidatos:
        puntuacion ← scoreRoutine(candidato, contexto)
        SI puntuacion > mejorPuntuacion:
            mejorPuntuacion ← puntuacion
            mejoresCandidatos ← [candidato]
        SI puntuacion = mejorPuntuacion:
            mejoresCandidatos.agregar(candidato)

    DEVOLVER elegirAlAzar(mejoresCandidatos)
```

---

## Fase 4 — Trazabilidad de la recomendación

Junto con el nombre de la rutina recomendada, el sistema devuelve al cliente la categoría y el nivel de dificultad seleccionados. En las pruebas unitarias, el método `scoreRoutine` puede invocarse de forma aislada para obtener el desglose completo de la puntuación (`ScoreBreakdown`), lo que permite verificar la trazabilidad del razonamiento del algoritmo en cada caso de prueba.

---

## Justificación del diseño

Los pesos elegidos para cada componente de la función de puntuación reflejan una jerarquía deliberada de criterios clínicos:

1. **La dificultad tiene el mayor peso** (hasta +4) porque adaptar la intensidad al estado físico del paciente es el objetivo principal del sistema y el factor con mayor impacto en la seguridad y adherencia.
2. **La variedad de categoría** (+2) es el segundo criterio, ya que la literatura clínica recomienda alternar tipos de ejercicio (aeróbico, fuerza, flexibilidad) para una recuperación integral.
3. **El material disponible** actúa como desempate fino (+1), relevante solo en ausencia de fallback.
4. **La penalización por repetición** (−3 por aparición) es el único mecanismo con valor negativo y puede reducir la puntuación total por debajo de cero si una rutina se ha repetido muchas veces recientemente, forzando la diversificación incluso cuando otras condiciones favorecerían repetirla.

Esta arquitectura de puntuación permite ajustar el comportamiento del sistema simplemente modificando los valores de `SCORING_WEIGHTS` sin alterar la lógica del algoritmo, facilitando la calibración futura basada en resultados clínicos.
