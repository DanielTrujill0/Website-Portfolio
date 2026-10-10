/* Original SVG drawings. Change these paths to customize the artwork. */
window.PortfolioSketch = {
  create() {
    const source=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 440" class="sketch-illustration" role="img" aria-label="Hand-drawn notebook, pencil, light bulb, camera, and paper plane">
    <g class="sketch-sheet"><path d="M89 50 413 65 402 360 74 341Z" fill="var(--background)" stroke="currentColor" stroke-width="1.5"/><path d="m101 56 298 15-8 274-305-16" fill="none" stroke="currentColor" opacity=".17"/><path d="m102 111 273 14m-276 28 271 12m-274 27 271 15m-274 24 271 15m-274 25 271 14m-274 26 271 14" stroke="currentColor" opacity=".13"/><path d="m123 65-12 266" stroke="#b16b60" opacity=".3"/></g>
    <path d="m137 34 110 9-4 38-109-11Z" fill="var(--accent)" opacity=".8"/>
    <g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path class="sketch-stroke" pathLength="1" d="M173 101c-8-30 29-53 52-37 23 16 12 42-4 55l-3 20-25-1-2-19c-7-2-12-8-18-18Zm18 40 27 2m-25 5 22 1m-20 5 16 1m-14-44 3 22m9-23-5 24m-7-50c-10-1-14 5-15 10"/>
    <path class="sketch-stroke" pathLength="1" d="m174 67-13-11m36-1 1-18m32 21 13-10m-2 40 18-1m-87 5-19 2"/>
    <path class="sketch-stroke" pathLength="1" d="m278 121 62 18 29-39-91 21 31 3 5 27 12-14m-17-13 60-24"/>
    <path class="sketch-stroke" pathLength="1" d="M298 159c-42 7-21 34 5 34s26 25-14 31"/>
    <path class="sketch-stroke" pathLength="1" d="m146 203 27 1 9-16 32 2 8 16 47 2-3 66-123-4 3-67Zm47 14c-36 1-32 49-4 49 32 0 35-49 4-49Zm-1 10c-19 1-18 26 0 27 17 1 20-29 0-27Zm48-11 14 1-1 8-14-1Z"/>
    <path class="sketch-stroke" pathLength="1" d="m297 247 18-47 22 9-18 47-13 13-9-22Zm3-5 21 8m-6-50 5-12c3-6 20 1 17 7l-5 13m-26 61 9-5m-1-46-9 26"/>
    <path class="sketch-stroke" pathLength="1" d="M121 381c-46-9-73-43-76-82m-9 17 9-19 18 12m325-108c35-6 39-29 22-35m-10 1 13-1 1 13"/>
    <path class="sketch-stroke" pathLength="1" d="m432 287 6 15 16 4-15 7-4 17-8-15-15-4 15-8 5-16Zm-392-145 4 12 13 3-12 5-3 13-6-11-12-4 12-5 4-13"/>
    <path class="sketch-stroke" pathLength="1" d="m349 315 8 8 15-17m-154 87c29-11 63-9 95-5m-93 11c27-6 50-5 72-2"/>
    </g>
    <g fill="currentColor" font-family="'Segoe Print','Comic Sans MS',cursive" font-size="18"><text x="165" y="317" transform="rotate(3 165 317)">start with a sketch.</text><text x="365" y="44" font-size="14" transform="rotate(8 365 44)">what if…?</text><text x="50" y="400" font-size="14" transform="rotate(-6 50 400)">keep exploring ↗</text></g>
    <g class="pixel-heart" fill="var(--accent)" stroke="currentColor" stroke-width=".5"><path d="M422 64h8v-8h16v8h8v16h-8v8h-8v8h-8v-8h-8v-8h-8V64Z"/></g></svg>`;
    return new DOMParser().parseFromString(source,'image/svg+xml').documentElement;
  }
};
