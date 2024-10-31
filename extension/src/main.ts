import './style.css'
import OBR from '@owlbear-rodeo/sdk'
import { Shape } from '@owlbear-rodeo/sdk'
import { getPluginId } from './helper.ts'
import { isPlainObject } from './helper.ts'
OBR.onReady(() => {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1> Avrae Owlbear Sync </h1>
    <div> Select a discord channel to link to: 1301245033302851614 </div>
    <input type="text" placeholder="Channel ID" id="channel-id" value="1301245033302851614"/>
    <button type="button" id="clear-tokens"> Clear all effects </button>
  </div>
`
})


document.querySelector("#clear-tokens")?.addEventListener("click", async () => {
  console.log("is clicked")
  const currentAttachments = await OBR.scene.items.getItems<Shape>((item) => {
    const metadata = item.metadata[getPluginId("metadata")];
    return Boolean(isPlainObject(metadata));
  });
  console.log(currentAttachments)
  await OBR.scene.items.deleteItems(currentAttachments.map((a) => a.id))
})
import "./socket.ts"