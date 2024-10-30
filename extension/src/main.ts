import './style.css'
import OBR from '@owlbear-rodeo/sdk'
import { getPluginId, isPlainObject } from "./helper.ts"

import { Image, isImage, buildImage } from "@owlbear-rodeo/sdk";

import type { Shape } from '@owlbear-rodeo/sdk';
OBR.onReady(() => {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1> Avrae Owlbear Sync </h1>
    <div> Select a discord channel to link to: 1301245033302851614 </div>
    <input type="text" placeholder="Channel ID" id="channel-id" value="1301245033302851614"/>
    <div id="table"> </div>
  </div>
`
  let input = document.querySelector<HTMLInputElement>("#channel-id")
})

const urlBase = "http://localhost:5173"

import "./socket.ts"