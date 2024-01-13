<script lang="ts">
  import type { EnergyUseData } from '../../../../../shared-types'

  export let energyUseData: EnergyUseData

  const range = (min: number, max: number, percentage: number) => {
    const difference = max - min
    return min + (percentage * difference)
  }

  const roundToDecimals = (value: number, places: number) =>
    Math.round(value * 10 ** places) / 10 ** places

  const kwString = (watts: number) => {
    const kwValue = Math.abs(watts) / 1000.0
    const roundedValue = roundToDecimals(kwValue, 1)

    return roundedValue.toLocaleString(undefined, {
      maximumFractionDigits: 1,
      maximumSignificantDigits: 2,
    })
  }

  $: batteryString = kwString(energyUseData.batteryInputOutputWatts)
  $: gridString = kwString(energyUseData.gridInputOutputWatts)
  $: homeString = kwString(energyUseData.homeConsumptionWatts)
  $: inverterString = kwString(energyUseData.inverterInputOutputWatts)
  $: solarString = kwString(energyUseData.solarInputOutputsWatts)

  const batteryFillMinWidth = 78.75
  const batteryFillMaxWidth = 132.5
  $: batteryFillWidth = range(batteryFillMinWidth, batteryFillMaxWidth, energyUseData.batteryChargePercentage)
</script>

<div class="w-full h-full font-sans">
  <svg viewBox="22 5 445 280" fill="none" font-size="31">
    <g id="Frame 1" clip-path="url(#clip0_0_1)">
      <g id="InverterGroup">
        <text
          id="InverterFigure"
          x="245"
          y="127.136"
          text-anchor="middle"
          fill="black">{inverterString} kW</text
        >
        {#if energyUseData.inverterInputOutputWatts > 0}
          <path
            id="OutArrow"
            d="M318.986 116.289C319.5 115.889 319.5 115.111 318.986 114.711L304.364 103.333C303.707 102.822 302.75 103.29 302.75 104.122L302.75 126.878C302.75 127.71 303.707 128.178 304.364 127.667L318.986 116.289Z"
            class="fill-blue-400"
          />
        {:else}
          <path
              id="InArrow"
              d="M171.014 114.711C170.5 115.111 170.5 115.889 171.014 116.289L185.636 127.667C186.293 128.178 187.25 127.71 187.25 126.878L187.25 104.122C187.25 103.29 186.293 102.822 185.636 103.333L171.014 114.711Z"
              class="fill-blue-400"
            />
        {/if}
        <g id="Group 1">
          <circle
            id="Ellipse 2"
            cx="242.5"
            cy="155.5"
            r="19"
            stroke="black"
            stroke-width="3"
          />
          <path
            id="Vector 13"
            d="M242.2 161.85L240.6 156L247 163.8H243.8L245.4 169L239 161.85H242.2Z"
            stroke="black"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <g id="Rectangle 2">
            <mask id="path-6-inside-1_0_1" fill="white">
              <rect x="231" y="144" width="23" height="9" rx="1" />
            </mask>
            <rect
              x="231"
              y="144"
              width="23"
              height="9"
              rx="1"
              stroke="black"
              stroke-width="4"
              stroke-linejoin="round"
              mask="url(#path-6-inside-1_0_1)"
            />
          </g>
        </g>
      </g>
      <g id="GridGroup">
        {#if energyUseData.gridInputOutputWatts > 0}
          <path
            id="OutArrow_2"
            d="M450.289 90.0142C449.889 89.4997 449.111 89.4997 448.711 90.0142L437.333 104.636C436.822 105.293 437.29 106.25 438.122 106.25L460.878 106.25C461.71 106.25 462.178 105.293 461.667 104.636L450.289 90.0142Z"
            class="fill-blue-400"
          />
        {:else}
          <path
            id="InArrow_2"
            d="M448.711 107.986C449.111 108.5 449.889 108.5 450.289 107.986L461.667 93.3641C462.178 92.7073 461.71 91.75 460.878 91.75H438.122C437.29 91.75 436.822 92.7073 437.333 93.3641L448.711 107.986Z"
            class="fill-blue-400"
          />
        {/if}
        <text
          x="380"
          y="110.136"
          id="GridFigure"
          fill="black"
          text-anchor="middle"
        >
          {gridString} kW
        </text>
        <g id="Group 3">
          <path
            id="Vector 11"
            d="M364.157 74.4444L371.145 46.9444M392.111 74.4444L385.122 46.9444M398.5 33.9802L396.503 30.4444H360.563L358.167 33.9802M371.145 46.9444L378.134 19.4444L385.122 46.9444M371.145 46.9444H385.122"
            stroke="black"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            id="Vector 12"
            d="M338 17C339.197 26.5645 351.008 38.52 357.393 34.1363M362.981 17C364.178 26.5645 392.114 38.52 398.5 34.1363"
            stroke="black"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
        <path
          id="GridArrow"
          d="M378 124V155H276"
          stroke="black"
          stroke-width="4"
          stroke-linejoin="round"
        />
      </g>
      <g id="SolarGroup">
        <g id="Group 6">
          <circle
            id="Ellipse 1"
            cx="82.5"
            cy="28.5"
            r="6"
            stroke="black"
            stroke-width="3"
          />
          <path
            id="Vector 2"
            d="M132.032 52H93.328L82 71H122.12L132.032 52ZM132.032 52L141 71M92.856 61.7317L96.16 55.7073H105.6M92.856 61.7317L89.552 67.2927H98.992M92.856 61.7317H120.704M120.704 61.7317L117.4 67.2927H108.432M120.704 61.7317L124.008 55.7073H115.04M105.6 55.7073H110.084H115.04M105.6 55.7073L98.992 67.2927M98.992 67.2927H103.476H108.432M115.04 55.7073L108.432 67.2927"
            stroke="black"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            id="Vector 3"
            d="M94 29H99"
            stroke="black"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            id="Vector 4"
            d="M66 29H71"
            stroke="black"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            id="Vector 5"
            d="M82 40V45"
            stroke="black"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            id="Vector 6"
            d="M82 12V17"
            stroke="black"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            id="Vector 7"
            d="M90.9853 20.7218L94.5208 17.1863"
            stroke="black"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            id="Vector 8"
            d="M71.1863 40.5208L74.7218 36.9853"
            stroke="black"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            id="Vector 9"
            d="M90.2782 36.9853L93.8137 40.5208"
            stroke="black"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            id="Vector 10"
            d="M70.4792 17.1863L74.0147 20.7218"
            stroke="black"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
        <text
          x="110"
          y="110.136"
          id="SolarFigure"
          fill="black"
          text-anchor="middle">{solarString} kW</text
        >
        {#if energyUseData.solarInputOutputsWatts > 0}
          <path
            id="InArrow_3"
            d="M37.7108 106.986C38.1112 107.5 38.8888 107.5 39.2892 106.986L50.6673 92.3641C51.1784 91.7073 50.7104 90.75 49.8781 90.75H27.1219C26.2896 90.75 25.8216 91.7073 26.3327 92.3641L37.7108 106.986Z"
            class="fill-blue-400"
          />
        {:else}
          <path
            id="OutArrow_3"
            d="M39.2892 89.0142C38.8888 88.4997 38.1112 88.4997 37.7108 89.0142L26.3327 103.636C25.8216 104.293 26.2896 105.25 27.1219 105.25L49.8781 105.25C50.7104 105.25 51.1784 104.293 50.6673 103.636L39.2892 89.0142Z"
            class="fill-blue-400"
          />
        {/if}
        <path
          id="SolarArrow"
          d="M108 124V155H210"
          stroke="black"
          stroke-width="4"
          stroke-linejoin="round"
        />
      </g>
      <g id="BatteryGroup">
        <g id="battery-full" clip-path="url(#clip1_0_1)">
          <path
            id="Vector"
            d="M78.75 247.25 H{batteryFillWidth} V268.75 H78.75 V247.25 Z"
            fill="black"
          />
          <path
            id="Vector_2"
            d="M78.75 236.5C75.8989 236.5 73.1646 237.633 71.1486 239.649C69.1326 241.665 68 244.399 68 247.25V268.75C68 271.601 69.1326 274.335 71.1486 276.351C73.1646 278.367 75.8989 279.5 78.75 279.5H132.5C135.351 279.5 138.085 278.367 140.101 276.351C142.117 274.335 143.25 271.601 143.25 268.75V247.25C143.25 244.399 142.117 241.665 140.101 239.649C138.085 237.633 135.351 236.5 132.5 236.5H78.75ZM132.5 241.875C133.926 241.875 135.293 242.441 136.301 243.449C137.309 244.457 137.875 245.824 137.875 247.25V268.75C137.875 270.176 137.309 271.543 136.301 272.551C135.293 273.559 133.926 274.125 132.5 274.125H78.75C77.3245 274.125 75.9573 273.559 74.9493 272.551C73.9413 271.543 73.375 270.176 73.375 268.75V247.25C73.375 245.824 73.9413 244.457 74.9493 243.449C75.9573 242.441 77.3245 241.875 78.75 241.875H132.5ZM154 258C154 260.138 153.151 262.189 151.639 263.701C150.127 265.213 148.076 266.062 145.938 266.062V249.938C148.076 249.938 150.127 250.787 151.639 252.299C153.151 253.811 154 255.862 154 258Z"
            fill="black"
          />
        </g>
        <text
          id="BatteryFigure"
          fill="black"
          x="110"
          y="223.136"
          text-anchor="middle">{batteryString} kW</text
        >
        {#if energyUseData.batteryInputOutputWatts > 0}
          <path
            id="OutArrow_4"
            d="M39.2892 201.014C38.8888 200.5 38.1112 200.5 37.7108 201.014L26.3327 215.636C25.8216 216.293 26.2896 217.25 27.1219 217.25L49.8781 217.25C50.7104 217.25 51.1784 216.293 50.6673 215.636L39.2892 201.014Z"
            class="fill-blue-400"
          />
        {:else}
          <path
            id="InArrow_4"
            d="M37.7108 218.986C38.1112 219.5 38.8888 219.5 39.2892 218.986L50.6673 204.364C51.1784 203.707 50.7104 202.75 49.8781 202.75H27.1219C26.2896 202.75 25.8216 203.707 26.3327 204.364L37.7108 218.986Z"
            class="fill-blue-400"
          />
        {/if}
        <path
          id="BatteryArrow"
          d="M108 186V155H210"
          stroke="black"
          stroke-width="4"
          stroke-linejoin="round"
        />
      </g>
      <g id="HouseGroup">
        {#if energyUseData.homeConsumptionWatts > 0}
          <path
            id="InArrow_5"
            d="M448.711 219.986C449.111 220.5 449.889 220.5 450.289 219.986L461.667 205.364C462.178 204.707 461.71 203.75 460.878 203.75H438.122C437.29 203.75 436.822 204.707 437.333 205.364L448.711 219.986Z"
            class="fill-blue-400"
          />
        {:else}
          <path
            id="OutArrow_5"
            d="M450.289 202.014C449.889 201.5 449.111 201.5 448.711 202.014L437.333 216.636C436.822 217.293 437.29 218.25 438.122 218.25L460.878 218.25C461.71 218.25 462.178 217.293 461.667 216.636L450.289 202.014Z"
            class="fill-blue-400"
          />
        {/if}
        <text
          id="HouseFigure"
          fill="black"
          x="380"
          y="223.136"
          text-anchor="middle">{homeString} kW</text
        >
        <g id="house">
          <path
            id="Vector_3"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M356.125 274.094V250.938H359.688V274.094C359.688 274.566 359.875 275.019 360.209 275.353C360.543 275.687 360.996 275.875 361.469 275.875H393.531C394.004 275.875 394.457 275.687 394.791 275.353C395.125 275.019 395.312 274.566 395.312 274.094V250.938H398.875V274.094C398.875 275.511 398.312 276.87 397.31 277.872C396.308 278.875 394.949 279.438 393.531 279.438H361.469C360.051 279.438 358.692 278.875 357.69 277.872C356.688 276.87 356.125 275.511 356.125 274.094V274.094ZM395.312 234.906V247.375L388.188 240.25V234.906C388.188 234.434 388.375 233.981 388.709 233.647C389.043 233.313 389.496 233.125 389.969 233.125H393.531C394.004 233.125 394.457 233.313 394.791 233.647C395.125 233.981 395.312 234.434 395.312 234.906Z"
            fill="black"
          />
          <path
            id="Vector_4"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M374.981 231.344C375.649 230.676 376.555 230.301 377.5 230.301C378.445 230.301 379.351 230.676 380.019 231.344L403.699 255.02C404.033 255.355 404.221 255.808 404.221 256.281C404.221 256.754 404.033 257.208 403.699 257.542C403.364 257.877 402.911 258.065 402.438 258.065C401.964 258.065 401.511 257.877 401.176 257.542L377.5 233.862L353.824 257.542C353.489 257.877 353.036 258.065 352.563 258.065C352.089 258.065 351.636 257.877 351.301 257.542C350.967 257.208 350.779 256.754 350.779 256.281C350.779 255.808 350.967 255.355 351.301 255.02L374.981 231.344Z"
            fill="black"
          />
        </g>
        <path
          id="HouseArrow"
          d="M378 186V155H276"
          stroke="black"
          stroke-width="4"
          stroke-linejoin="round"
        />
      </g>
    </g>
    <defs>
      <clipPath id="clip0_0_1">
        <rect width="479" height="299" fill="white" />
      </clipPath>
      <clipPath id="clip1_0_1">
        <rect width="86" height="86" transform="translate(68 215)" />
      </clipPath>
    </defs>
  </svg>
</div>
