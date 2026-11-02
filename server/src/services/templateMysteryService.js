import { DIFFICULTY_RULES } from '../config/gameRules.js';

// Each record is a complete authored case. The first three witnesses and five
// clues form a solvable Easy investigation; later entries extend the same
// timeline with additional suspects and corroborating evidence.
const scenarios = [
  {
    id: 'missing-letter', kind: 'letter', title: 'The Salt-Stained Letter', place: 'Greyhaven Lighthouse',
    incident: 'Keeper Elias Rook’s signed warning letter vanished from the sealed lantern-room archive before the coastal hearing.',
    culprit: 'Mina Vale', motive: 'She removed the letter because it proved she had falsified the lighthouse repair accounts to hide her brother’s dangerous shortcuts.',
    suspects: [
      ['Jonas Pike','Assistant keeper who maintains the lantern mechanism','He was on the north gallery from 8:10 to 8:30','He feared the hearing would close the lighthouse and cost him his post.'],
      ['Mina Vale','Archive clerk entrusted with the hearing papers','She says she stayed in the chart room from 8:05 to 8:35','The letter exposed her altered repair accounts and her brother’s role.'],
      ['Ruth Calder','Coastal solicitor visiting to review the evidence','She says she was on a recorded call in the harbor office','She hoped to discredit the keeper in a boundary dispute.'],
      ['Tomas Wren','Signal technician working on the west stair','His tool checkout places him outside the archive during the removal','He had complained that the hearing delayed his contract payment.'],
      ['Ada Finch','Local reporter waiting for a public statement','A pier watchman saw her leave before the archive was opened','She wanted an exclusive story about the lighthouse.'],
    ],
    clues: [
      ['Archive Seal Impression','The archive seal was lifted cleanly and pressed back before the morning inspection.','Mina Vale used the clerk’s warming plate to soften and restore the seal without tearing it.'],
      ['Blue Carbon Dust','Blue carbon dust from the duplicate ledger was found inside the letter’s empty sleeve.','Mina Vale handled the ledger while copying the warning and left the same distinctive carbon on the sleeve.'],
      ['Lantern-Room Register','The archive key was signed out at 8:12 and returned at 8:29.','Mina Vale signed for the key during the exact interval in which she says she remained in the chart room.'],
      ['North Gallery Lamp Tag','Jonas Pike’s lamp checks were recorded on the north gallery throughout the archive window.','The time record places Jonas Pike away from the archive during the removal.'],
      ['Harbor Call Transcript','The office exchange records Ruth Calder speaking continuously from 8:14 to 8:26.','The recorded call contradicts Ruth Calder’s opportunity to enter the archive.'],
      ['North Gallery Lamp Log','A pressure sensor records Jonas Pike’s lantern checks at 8:16 and 8:24.','Jonas Pike was on the north gallery during the key interval.'],
      ['Revised Repair Ledger','A fresh ledger copy removes the disputed repair entry but retains Mina Vale’s copying marks.','Mina Vale altered the records after taking the letter to prevent the hearing from matching the accounts.'],
      ['Pier Watch Note','The watchman logged Ada Finch’s departure at 7:58 and her return after sunrise.','Ada Finch had left before the letter disappeared.'],
      ['Wax Warmer Residue','The seal wax contains flecks matching the archive clerk’s brass warming plate.','Mina Vale had the means to restore the seal and conceal the letter’s removal.'],
    ],
    hints: ['Compare the archive key interval with the claimed chart-room alibi.','The restored seal and the carbon dust connect the handling of the papers to the records desk.','Use the independent gallery, call and tool logs to test the remaining alibis.'],
    explain: 'Mina Vale used her archive access to remove the warning, restored the seal, then changed the repair ledger so the hearing would not expose her falsification.',
  },
  {
    id: 'royal-letter', kind: 'letter', title: 'The Missing Royal Letter', place: 'Aurellian Royal Archive',
    incident: 'A confidential succession letter vanished from a sealed royal archive shortly before the council convened.',
    culprit: 'Elena Voss', motive: 'She removed the letter because it exposed her forged copy of the succession registry, which she altered to secure a title for her cousin.',
    suspects: [
      ['Alden Price','Senior archivist responsible for the archive seal','A gallery attendant saw him in the map room during the removal','He feared the council would blame him for a delayed catalog audit.'],
      ['Elena Voss','Junior copyist assigned to prepare the council papers','She says she remained in the reading room throughout the archive window','The letter exposed her forged succession registry and her cousin’s claim.'],
      ['Maris Dain','Royal courier who delivered the sealed correspondence','The gate ledger records her departure before the archive was opened','She wanted to delay a decision about her own appointment.'],
      ['Tomas Rell','Council secretary responsible for the meeting schedule','A signed agenda places him in the council chamber','He opposed the proposed succession but had no archive key.'],
      ['Sabine Holt','Conservator who repaired the archive shelves','Her restoration log and tool seal place her in the east gallery','She had requested more time for the collection audit.'],
    ],
    clues: [
      ['Restored Seal Wax','The archive seal is intact, but its edge contains a trace of fresh violet sealing wax.','Elena Voss used the copyist’s violet wax to restore the seal after removing the letter.'],
      ['Registry Carbon Dust','Carbon dust from the altered succession registry is caught inside the empty letter sleeve.','Elena Voss handled the forged registry while removing the letter that could expose it.'],
      ['Archive Key Register','The archive key was signed out under Elena Voss’s name during the interval she claims to have stayed in the reading room.','Elena Voss’s own key entry contradicts her reading-room alibi.'],
      ['Map Room Attendant Log','A signed gallery log places Alden Price in the map room for the full archive interval.','Alden Price was away from the sealed archive while the letter disappeared.'],
      ['Courier Gate Ledger','Maris Dain’s courier token was recorded outside the palace before the archive opened.','Maris Dain had left the palace before the removal.'],
      ['Council Agenda Copy','Tomas Rell initialled the meeting agenda in the council chamber during the key interval.','Tomas Rell remained in the chamber and had no archive key.'],
      ['Copyist Desk Impression','A fresh impression from the missing letter’s ribbon matches the copyist’s desk press.','Elena Voss prepared the letter at her desk before returning to remove it from the archive.'],
      ['Restoration Tool Seal','Sabine Holt’s restoration tools remained sealed in the east gallery throughout the interval.','Sabine Holt could not have used her tools to enter or tamper with the archive.'],
      ['Registry Correction Draft','A discarded correction draft changes the same succession entry described in the missing letter.','Elena Voss altered the registry and removed the letter to keep the forged claim from the council.'],
    ],
    hints: ['Compare the archive key register with the copyist’s reading-room account.','The wax and carbon dust connect the letter to the altered registry.','The council and gallery records independently account for the other visitors.'],
    explain: 'Elena Voss used her archive access to remove the succession letter, restored the seal with copyist wax and tried to conceal the forged registry entry that benefited her cousin.',
  },
  {
    id: 'missing-person', kind: 'person', title: 'The Empty Berth', place: 'Northstar Alpine Lodge',
    incident: 'Expedition medic Dr. Leena Shah disappeared from a locked lodge during a blizzard, leaving her coat and medicine behind.',
    culprit: 'Caleb Frost', motive: 'He hid Leena in the old storm shelter after she discovered he had diverted the expedition’s oxygen stores for a private sale.',
    suspects: [
      ['Nora Bell','Lodge manager who controls the guest keys','She was on a radio check with the valley station','She feared the expedition would blame her for the storm closure.'],
      ['Caleb Frost','Supply guide responsible for the emergency stores','He claims he slept in the east bunkroom throughout the night','Leena had found evidence that he sold reserve oxygen cylinders.'],
      ['Iris Chen','Climber and Leena’s former expedition partner','She was treating a sprained wrist in the dining room','She resented Leena’s decision to lead the next ascent.'],
      ['Pavel Orlov','Radio operator monitoring the ridge repeater','His logged transmissions span the disappearance window','He feared a rescue delay would expose an earlier equipment failure.'],
      ['Mae Rowan','Cook assigned to the lower kitchen','The stove pressure log and two witnesses place her below','She had argued with Leena over ration use.'],
    ],
    clues: [
      ['Two Mug Rings','Two fresh tea rings sit beside the storm-shelter map although only one cup is in the lodge kitchen.','Caleb Frost prepared a second drink for Leena after moving her to the shelter.'],
      ['Oxygen Inventory Stub','A torn inventory stub lists the missing reserve cylinders under Caleb Frost’s initials.','Caleb Frost concealed the motive for keeping Leena from reporting the diverted oxygen.'],
      ['Shelter Snow Track','A narrow track leads from the supply hatch to the old storm shelter and returns once.','Caleb Frost carried Leena along the sheltered route and came back alone.'],
      ['Valley Radio Log','Nora Bell’s call to the valley station began before Leena’s last confirmed sighting and continued afterward.','The recorded radio check excludes Nora Bell from moving Leena.'],
      ['Dining Room Splint','Iris Chen’s wrist splint is timestamped by the lodge medic at the time Leena vanished.','Iris Chen could not have safely carried Leena through the snow.'],
      ['Repeater Transcript','Pavel Orlov transmitted ridge conditions at regular intervals through the night.','Pavel Orlov remained at the radio desk during the critical period.'],
      ['Supply Cage Seal','The emergency supply cage was opened with Caleb Frost’s guide key shortly before the storm-shelter track appeared.','Caleb Frost used his supply access to prepare the shelter route and move Leena.'],
      ['Fresh Shelter Blanket','A blanket from the supply room is warm and carries lodge tea, but no outside snow.','Caleb Frost had visited the shelter recently and left it ready for Leena.'],
      ['Rescue Flare Count','One flare is missing from the guide kit, but the shelter signal mirror remains untouched.','Caleb Frost planned to keep Leena hidden, not signal an outside abductor.'],
    ],
    hints: ['Follow the route between the supply hatch and the storm shelter.','The inventory discrepancy gives the person who moved Leena a reason to keep her quiet.','Separate the opportunity to leave the lodge from the motive to hide the oxygen records.'],
    explain: 'Caleb Frost moved Leena to the lodge’s storm shelter after she found his oxygen-sale records. The tea, snow track and inventory stub establish the route, opportunity and motive; the other witnesses are independently accounted for.',
  },
  {
    id: 'missing-train-passenger', kind: 'train-passenger', title: 'The Empty Compartment', place: 'The North Line night train',
    incident: 'Passenger Ada Lin vanished from her locked sleeper compartment while the North Line was travelling between Dunmere and Ashford. Her travelling case, ticket and coat remained aboard.',
    suspects: [
      ['Ruth Calder','Sleeping-car attendant assigned to the forward coach','She was serving tea in the dining car during the reported interval','She feared a service complaint would cost her the route.'],
      ['Elias Vane','Conductor responsible for keys and the passenger manifest','He says he was checking the rear signal lamps','Ada had found that he was replacing cargo entries in the manifest to hide a parcel he had diverted.'],
      ['Jon Bell','Passenger in the adjoining compartment','A dining-car receipt and two witnesses place him at dinner','He had argued with Ada about her notes.'],
      ['Mara Holt','Railway inspector travelling to Ashford','Her inspection docket records a continuous review in the brake van','She had authority to question the train crew.'],
      ['Theo Grant','Dining steward who served the late seating','The service bell panel records his work through the interval','He owed Ada money from a private card game.'],
    ],
    clues: [
      ['Unbroken Compartment Seal','Ada Lin’s sleeper seal is intact, but a faint second set of wheel marks crosses the corridor carpet.','Elias Vane used his conductor key to open the connecting service door without disturbing the passenger seal.'],
      ['Manifest Carbon Copy','A carbon copy shows a parcel entered in the mail van under a false destination after departure.','Elias Vane changed the manifest to conceal the diverted parcel that Ada had discovered.'],
      ['Service-Door Key Register','The conductor’s service key was checked out at 10:14 p.m. and returned at 10:31 p.m.','Elias Vane held the only key that opened the passage from the sleeper coach to the sealed mail van during Ada’s disappearance.'],
      ['Dining-Car Receipt','Jon Bell’s meal was paid for at 10:18 p.m., and the waiter recorded him at the table until 10:36.','Jon Bell was in the dining car throughout the movement between coaches.'],
      ['Tea Service Bell Panel','The forward-car service panel shows Ruth Calder answering calls from 10:12 to 10:29.','Ruth Calder remained in the forward coach and did not take Ada through the service door.'],
      ['Inspector’s Docket Times','Mara Holt initialled inspection entries at 10:16, 10:23 and 10:30 in the brake van.','Mara Holt was working in the separate brake van during the key interval.'],
      ['Conductor’s Route Sheet','Elias Vane’s route sheet has the mail-van transfer marked in his hand during the service-key interval.','Elias Vane used the service passage while the passenger was moved from the sleeper coach.'],
      ['Steward’s Linen Tally','A linen count signed at 10:28 places Theo Grant in the dining car while a spare railway blanket is sent toward the mail van.','Theo Grant was serving meals; Elias Vane used the unassigned blanket to cover Ada Lin after moving her into the mail van.'],
      ['False Destination Chalk','The parcel’s destination chalk matches the correction in Elias Vane’s private route notebook.','Elias Vane altered the cargo entry and used the same false destination to conceal where he had moved Ada Lin.'],
    ],
    hints: ['Compare the conductor-key interval with the two connected train cars.','The false cargo entry and the passenger’s discovery give the conductor a reason to move her.','Use the dining, service and inspection records to place the other witnesses.'],
    explain: 'Elias Vane used the conductor’s service key to move Ada Lin from her sleeper compartment into the sealed mail van, where he hid her beneath a railway blanket while the train continued to Ashford. He did so after she discovered the false cargo entry he used to conceal a diverted parcel. The key register fixes his opportunity; the manifest copy and false-destination note establish his method and motive, while the other occupants are accounted for by independent records.',
  },
  {
    id: 'stolen-object', kind: 'theft', title: 'The Vanishing Bluebird', place: 'Bellflower Theatre',
    incident: 'The blue enamel bird brooch disappeared from a locked dressing-room cabinet minutes before the opening performance.',
    culprit: 'Lena Ortiz', motive: 'She planned to pawn the brooch to pay for the theatre’s overdue rent after secretly guaranteeing its lease.',
    suspects: [
      ['Peter Shaw','Stage manager controlling the scene-change keys','He called cues from the prompt desk during the theft','A missed opening would damage his standing with the company.'],
      ['Lena Ortiz','Wardrobe lead who prepared the lead actor’s costume','She says she stayed at the sewing station','She had privately guaranteed the theatre’s rent and faced a debt.'],
      ['Dorian West','Lead actor wearing the costume that used the brooch','He was in makeup under a continuous mirror camera','He wanted the brooch for a publicity story.'],
      ['Rae Bishop','Props assistant responsible for the cabinet inventory','She signed props back into the cage before the cabinet opened','She had been blamed for a missing prop last month.'],
      ['Felix Moore','Pianist in the orchestra pit','The conductor’s score shows he played without leaving the pit','He had asked to borrow the brooch for a portrait.'],
    ],
    clues: [
      ['Cabinet Thread Snag','A strand of gold wardrobe thread is caught in the cabinet’s concealed hinge.','Lena Ortiz’s gold thread matches the strand and shows she opened the cabinet from the side.'],
      ['Brooch Pin Sleeve','The empty velvet sleeve has a fresh crescent impression from the brooch pin.','Lena Ortiz folded the brooch into a costume hem after removing it.'],
      ['Rent Envelope','A pawnshop appointment card is tucked into the theatre rent envelope.','Lena Ortiz arranged to pawn the brooch to cover the rent she had guaranteed.'],
      ['Prompt Desk Cue Sheet','Peter Shaw called every cue from the prompt desk from 7:42 to 8:03.','Peter Shaw’s continuous cue record rules out a trip to the dressing room.'],
      ['Mirror Camera Reel','The mirror camera records Dorian West in makeup throughout the interval.','Dorian West never left the makeup room to reach the cabinet.'],
      ['Props Cage Seal','Rae Bishop’s props cage was sealed before the brooch cabinet was opened.','Rae Bishop lacked access to the dressing-room cabinet after her inventory return.'],
      ['Wardrobe Hem Weight','A newly weighted costume hem contains the exact outline of the brooch case.','Lena Ortiz hid the brooch in the costume she had prepared.'],
      ['Hem Weight','A newly weighted costume hem contains the exact outline of the brooch case.','Lena Ortiz hid the brooch in the costume she had prepared.'],
      ['Pawn Ticket Draft','A draft pawn ticket lists the brooch’s maker and a morning appointment under an alias.','Lena Ortiz prepared to sell the stolen piece before the theatre could discover it.'],
    ],
    hints: ['Look at the cabinet hinge and the material used in costume work.','The empty sleeve, altered hem and rent papers point to both method and motive.','Compare each suspect’s performance-window record with access to the dressing room.'],
    explain: 'Lena Ortiz opened the cabinet using her wardrobe access, hid the brooch in a weighted costume hem and planned to pawn it to pay the rent debt she had guaranteed.',
  },
  {
    id: 'museum-artifact', kind: 'museum', title: 'The Ashen Reliquary', place: 'Ashcombe Museum of Antiquities',
    incident: 'A bronze reliquary vanished from a sealed display during a short gallery blackout, leaving its pressure sensor undisturbed.',
    culprit: 'Sana Iqbal', motive: 'She intended to return the artifact to its village after discovering the museum’s acquisition record had been forged.',
    suspects: [
      ['Edwin Marsh','Gallery director who approved the exhibition','He was on the public floor with visiting trustees','The show’s success affected his renewal.'],
      ['Sana Iqbal','Collections conservator who treated the reliquary','She reports remaining in the conservation lab','She believed the museum had acquired it through a forged deed.'],
      ['Theo Grant','Security guard assigned to the east gallery','His checkpoint reader logged him at the east doors','He was reprimanded for an earlier alarm delay.'],
      ['Mila Hart','Registrar who prepared the object’s loan paperwork','She was on a recorded call with the lender','A paperwork error could cost her professional accreditation.'],
      ['Arun Das','Visiting scholar researching the reliquary’s provenance','A lecture recording places him in the auditorium','He wanted the artifact returned but lacked permission.'],
    ],
    clues: [
      ['Unbroken Sensor Seal','The display seal is intact, but a service panel behind the plinth was opened.','Sana Iqbal knew the plinth’s service panel from her conservation treatment.'],
      ['Red Clay Flake','Red clay matching the artifact’s old packing material lies inside the service panel.','Sana Iqbal used the original packing clay to cushion the reliquary during removal.'],
      ['Treatment Solvent Trace','A trace of conservation solvent appears on the panel latch.','Sana Iqbal used her lab solvent to silence the service panel latch.'],
      ['East Door Reader','Theo Grant’s badge registered at the east doors during the blackout.','Theo Grant was at the opposite gallery checkpoint.'],
      ['Trustee Photograph','A trustee photograph shows Edwin Marsh on the public floor throughout the outage.','Edwin Marsh remained with the visitors during the removal.'],
      ['Lender Call Recording','Mila Hart’s recorded call with the lender spans the full blackout.','Mila Hart was not in the gallery during the theft.'],
      ['Return Route Form','An unsigned collection-transfer form requests a return route to the reliquary’s village.','Sana Iqbal prepared a return route after confirming the artifact’s acquisition deed was forged.'],
      ['Forged Deed Comparison','The original deed bears a different village seal from the museum’s acquisition copy.','Sana Iqbal had confirmed the acquisition record was forged and acted to return the object.'],
      ['Packing Cradle','A fresh cradle shaped to the reliquary is hidden in the conservation supply cabinet.','Sana Iqbal prepared a safe transport cradle before removing the artifact.'],
    ],
    hints: ['The untouched display sensor suggests the object left by a service route.','Trace the materials at the panel back to the conservation process.','The provenance dispute explains the motive; the panel evidence establishes who acted.'],
    explain: 'Sana Iqbal used the service panel she knew from conservation work, cushioned the reliquary with its original clay and prepared a transport cradle. She intended to return it after discovering the forged acquisition deed.',
  },
  {
    id: 'locked-room', kind: 'locked-room', title: 'The Sealed Glasshouse', place: 'Ravenscourt Conservatory',
    incident: 'A rare moon orchid disappeared from a greenhouse locked from within; frost covered every window and the door seal was intact.',
    culprit: 'Silas Reed', motive: 'He planned to sell the orchid’s only cutting after learning the conservatory would close and his family nursery faced bankruptcy.',
    suspects: [
      ['Clara Moss','Head gardener who holds the greenhouse keys','She was in the boiler room during the temperature drop','She feared blame for the fragile orchid’s condition.'],
      ['Silas Reed','Night botanist who calibrated the misting system','He says he remained in the west potting shed','His family nursery owed money and could sell a cutting.'],
      ['June Park','Glasshouse apprentice assigned to the outer path','A rain gauge record places her outside the sealed door','She wanted to impress the visiting botanists.'],
      ['Emil Voss','Heating engineer called to inspect the boiler','His tool battery log places him in the basement','He was disputing an unpaid repair invoice.'],
      ['Tess Rowan','Botanical photographer working in the archive','Her timed plate exposures continued through the incident','She wanted a rare image for a private collector.'],
    ],
    clues: [
      ['Misting Valve Position','The interior misting valve was turned to drain the orchid bench shortly before the room was sealed.','Silas Reed calibrated that valve and used its drain cycle to mask the plant’s removal.'],
      ['Warm Wax at the Vent','A dab of fresh wax holds the narrow roof vent open by less than a finger’s width.','Silas Reed used the vent and wax to pass the wrapped cutting out without disturbing the door seal.'],
      ['Nursery Label Fragment','A label fragment from Reed family nursery stock is caught on the bench edge.','Silas Reed prepared a private container for the cutting.'],
      ['Boiler Pressure Chart','Clara Moss’s boiler adjustments are recorded in the service room for the entire interval.','Clara Moss could not have entered the greenhouse during the removal.'],
      ['Outer Path Rain Gauge','The gauge registered uninterrupted rain while June Park stood on the outer path.','June Park never crossed into the sealed greenhouse.'],
      ['Engineer Battery Log','Emil Voss’s tool battery shows continuous use in the basement.','Emil Voss remained below ground during the incident.'],
      ['Bench Soil Transfer','Fresh potting soil on the vent sill matches the soil Silas Reed used at the orchid bench.','Silas Reed used his pruning pole and bench soil while moving the cutting through the roof vent.'],
      ['Vent Reach Marks','Fresh soil on the vent ledge aligns with the gardener’s long pruning pole.','Silas Reed used his pole to retrieve the wrapped cutting through the roof vent.'],
      ['Ledger Sale Note','A nursery ledger records a promised payment for an unnamed rare cutting.','Silas Reed had arranged a sale to rescue the family nursery.'],
    ],
    hints: ['The intact door seal does not prove every opening was closed.','Look above the bench and compare the traces with greenhouse tools.','The valve timing, vent marks and private sale note fit one person’s access and motive.'],
    explain: 'Silas Reed drained the bench, used wax to hold the narrow roof vent open and passed a wrapped cutting through it with his pruning pole. The sealed door and frosted windows were never disturbed.',
  },
  {
    id: 'missing-evidence', kind: 'evidence', title: 'The Vanished Sample', place: 'Westbridge Forensic Archive',
    incident: 'A sealed glass vial central to a corruption inquiry vanished from a locked evidence refrigerator overnight.',
    culprit: 'Dr. Priya Sen', motive: 'She removed the vial after discovering it would expose her substitution of a control sample in the original report.',
    suspects: [
      ['Martin Lowe','Evidence custodian responsible for refrigerator access','He was on a recorded inventory call','He feared the inquiry would reveal a filing mistake.'],
      ['Dr. Priya Sen','Laboratory analyst who processed the vial','She says she was in the adjacent instrument room','The sample could prove she altered the control report.'],
      ['Gabe Ortiz','Night courier who delivered sealed evidence','The loading dock camera tracks his route','He was behind on a private loan.'],
      ['Helen Ward','Case prosecutor reviewing the chain of custody','A signed courtroom attendance log places her away','She wanted the inquiry to move quickly.'],
      ['Noah Kim','Freezer technician who serviced the backup unit','His maintenance telemetry is continuous','He had argued with the archive about access delays.'],
    ],
    clues: [
      ['Seal Number Reuse','The refrigerator seal is new, but its handwritten number repeats one from the analyst’s workbook.','Dr. Priya Sen replaced the seal after removing the vial and reused a number she had recorded.'],
      ['Control Vial Ledger','A control-vial entry is crossed out in Dr. Priya Sen’s handwriting.','Dr. Priya Sen substituted the control sample and needed the missing vial to conceal the change.'],
      ['Cold-Box Condensation','A dry crescent on the shelf shows a small cold box sat there after the defrost cycle.','Dr. Priya Sen moved the vial in a cold box before the refrigerator was resealed.'],
      ['Custodian Call Recording','Martin Lowe’s inventory call names each shelf while the refrigerator remains sealed.','Martin Lowe was documenting the shelves rather than removing evidence.'],
      ['Dock Camera Route','Gabe Ortiz’s courier cart never passes the evidence corridor.','Gabe Ortiz lacked access to the refrigerator.'],
      ['Court Attendance Record','Helen Ward signed into court before the sample was reported missing.','Helen Ward was away from the archive.'],
      ['Laboratory Door Access Log','The analyst credential opened the cabinet room during the narrow temperature change.','Dr. Priya Sen used her laboratory credential to reach the vial during the removal window.'],
      ['Instrument Room Printout','The adjacent instrument recorded no tests during the period Dr. Priya Sen claimed to be there.','Dr. Priya Sen’s stated alibi is contradicted by her own instrument’s idle record.'],
      ['Disposal Pickup Change','A pickup request for laboratory waste was advanced to just after the disappearance.','Dr. Priya Sen arranged a route to dispose of the vial after taking it.'],
    ],
    hints: ['Check whether the replacement seal and the written chain-of-custody record agree.','The cold-box trace and control ledger connect the missing sample to its analysis history.','A claimed room presence should leave an instrument record if it is true.'],
    explain: 'Dr. Priya Sen removed the vial in a cold box, replaced its seal with a reused number and altered the control record. The idle instrument disproves her alibi, while the ledger gives the reason.',
  },
  {
    id: 'biological-sample-lab', kind: 'biological-sample', title: 'The Empty Cryovial', place: 'Helix Ridge Research Laboratory',
    incident: 'A rare biological sample vanished from a locked research laboratory’s cryogenic cabinet overnight. Its access seal was replaced, and no other sample was disturbed.',
    suspects: [
      ['Dr. Mara Voss','Laboratory director with authority to approve sample transfers','She was presenting a remote seminar recorded from her office','The sample’s patent dispute threatened the lab’s grant.'],
      ['Dr. Nikhil Rao','Research fellow who collected and catalogued the sample','He says he remained in the imaging suite','The sample’s sequencing record would expose that he had substituted a control result.'],
      ['Yara Kim','Cryogenic technician who monitors cabinet temperatures','A continuous freezer telemetry log records her in the plant room','She had warned that the cabinet seal was unreliable.'],
      ['Owen Pike','Security officer assigned to the laboratory corridor','His patrol checkpoints cover the corridor throughout the night','He faced disciplinary action for a late patrol the week before.'],
      ['Dr. Elise Tran','Visiting collaborator reviewing the study protocol','A video conference log places her at the guest office','She wanted access to the sample for her own publication.'],
    ],
    clues: [
      ['Replacement Cryo Seal','The cabinet seal is new, but its serial number was issued to the research fellow’s bench kit.','Dr. Nikhil Rao replaced the seal after removing the sample and used a seal assigned to his bench.'],
      ['Sequence Control Ledger','A handwritten control entry conflicts with the instrument’s original sequencing file.','Dr. Nikhil Rao substituted the control result and had a reason to remove the sample before the discrepancy was audited.'],
      ['Imaging Suite Idle Log','The imaging suite recorded no scans during the interval Dr. Nikhil Rao claimed to be working there.','Dr. Nikhil Rao’s alibi is contradicted by the suite’s own equipment log.'],
      ['Cryogenic Temperature Trace','The cabinet warmed for four minutes, then returned to its set point without an alarm.','Dr. Nikhil Rao used the cabinet’s manual service mode to remove one vial without disturbing the other samples.'],
      ['Seminar Recording','Dr. Mara Voss answers questions continuously in a time-stamped seminar recording.','Dr. Mara Voss was in her office during the cabinet access window.'],
      ['Plant-Room Telemetry','Yara Kim’s technician badge and freezer readouts match continuously through the interval.','Yara Kim stayed in the plant room and did not access the research cabinet.'],
      ['Corridor Patrol Checkpoints','Owen Pike’s badge registered at both ends of the corridor with no gap long enough to reach the cabinet.','Owen Pike’s patrol record places him outside the laboratory at the relevant time.'],
      ['Guest Office Conference Log','Dr. Elise Tran’s video call remained connected from before the cabinet warmed until after it cooled.','Dr. Elise Tran was in the guest office during the removal.'],
      ['Bench Cryobox Receipt','A dry-ice receipt for a single cryobox was signed at the research fellow’s bench shortly before the audit.','Dr. Nikhil Rao prepared transport for the sample he removed from the cabinet.'],
    ],
    hints: ['Compare the replacement seal with the laboratory’s bench-kit issue records.','The temperature trace and instrument log can test the research fellow’s alibi.','The altered control record explains why one specific vial was taken.'],
    explain: 'Dr. Nikhil Rao used manual service mode to remove the rare sample, replaced the cabinet seal with one from his bench kit and prepared a cryobox for transport. He wanted to prevent an audit from exposing his substituted control result. The imaging log disproves his alibi; the seal, temperature trace and ledger establish his method and motive.',
  },
  {
    id: 'missing-manuscript', kind: 'document', title: 'The Printer’s Missing Page', place: 'Alder & Finch Press',
    incident: 'The final page of an unpublished memoir vanished from a locked proof cabinet before the author’s estate review.',
    culprit: 'Beatrice Cole', motive: 'She removed the page because it proved she had ghostwritten passages credited to another editor and forged the author’s approval.',
    suspects: [
      ['Hugh Mercer','Press owner who holds the cabinet master key','A delivery receipt places him at the loading bay','He wanted to avoid delaying the release.'],
      ['Beatrice Cole','Copy editor who prepared the final proof','She claims she worked on unrelated galley sheets','The page exposed her ghostwriting and forged approval.'],
      ['Omar Bell','Typesetter who handled the printing plates','His press counter shows an uninterrupted run','He feared a costly reprint.'],
      ['Nell Avery','Estate representative reviewing the memoir','A signed visitor log records her in the conference room','She wanted the memoir to remain unpublished.'],
      ['Caleb Dunn','Courier assigned to collect the sealed proofs','The dispatch camera shows him leaving before cabinet access','He had been offered money to delay delivery.'],
    ],
    clues: [
      ['Proof Cabinet Ribbon','A red proof ribbon is trapped beneath the cabinet latch.','Beatrice Cole used the editorial ribbon to keep the latch from clicking as she opened it.'],
      ['Author’s Blue Pencil','The missing page’s blue-pencil marks match corrections on Beatrice Cole’s galley sheets.','Beatrice Cole edited the page and knew exactly which approval marks would incriminate her.'],
      ['Approval Initial Draft','A discarded draft reproduces the author’s initials with the same unusual reversed stroke as the page copy.','Beatrice Cole forged the author’s approval and removed the page that revealed it.'],
      ['Loading Bay Receipt','Hugh Mercer signed a delivery receipt away from the proof room throughout the interval.','Hugh Mercer was at the loading bay, not the cabinet.'],
      ['Press Counter Strip','The typesetter’s counter strip records no interruption or plate change.','Omar Bell stayed at the press during the removal.'],
      ['Editorial Galley Sequence','Beatrice Cole’s assigned galley stack is missing the sheet she said she corrected.','Beatrice Cole’s account of working on unrelated sheets is false.'],
      ['Estate Review Routing Slip','Nell Avery’s review packet was logged in the conference room before the proof cabinet opened.','Nell Avery remained with the estate papers and had no access to the proof cabinet during the removal.'],
      ['Galley Sheet Sequence','Beatrice Cole’s assigned galley stack is missing the sheet she said she corrected.','Beatrice Cole’s account of working on unrelated sheets is false.'],
      ['Waste Bin Carbon','A torn carbon copy of the final page is found in the locked editorial waste bin.','Beatrice Cole attempted to destroy the copied page after removing the original.'],
    ],
    hints: ['The cabinet latch and the editing materials share a workroom source.','Compare the approval marks with the editor’s ordinary corrections.','The missing sheet number and the carbon copy trace what happened after removal.'],
    explain: 'Beatrice Cole quietly opened the proof cabinet with a ribbon, removed the page and discarded its carbon. Her editing marks and forged approval establish both access and motive.',
  },
  {
    id: 'missing-recording', kind: 'evidence', title: 'The Silent Reel', place: 'Harbor Radio Station',
    incident: 'A recording that could identify the source of a harbor warning disappeared from a locked broadcast vault before an inquiry.',
    culprit: 'Evan Price', motive: 'He erased the reel because it recorded his unauthorized transmission that sent a research vessel into unsafe water.',
    suspects: [
      ['Mara Quinn','Station director who scheduled the inquiry','She was live on air during the vault access window','She feared the station would lose its license.'],
      ['Evan Price','Sound engineer who maintains the tape vault','He says he was repairing the roof antenna','The reel recorded his unauthorized warning transmission.'],
      ['Lydia Shore','News presenter who first aired the warning','A studio camera shows her reading live bulletins','She wanted to protect her source.'],
      ['Rafi Bell','Archivist who catalogs historic broadcasts','His scanner log shows a continuous catalog session','He had disputed the reel’s classification.'],
      ['June Ellis','Harbor pilot who supplied the original report','A harbor patrol log keeps her on the water','She feared being blamed for the vessel’s course.'],
    ],
    clues: [
      ['Splice Tape Flake','A strip of fresh splicing tape is stuck to the vault’s inner hinge.','Evan Price used station splicing tape to remove the relevant segment without breaking the reel.'],
      ['Waveform Duplicate','A backup waveform ends at the exact point the unauthorized transmission begins.','Evan Price edited the reel where his own transmission would have been audible.'],
      ['Antenna Repair Ticket','The roof antenna repair ticket was opened after the inquiry was announced.','Evan Price created a false roof-repair alibi to explain his absence.'],
      ['Live Studio Camera','Mara Quinn appears on the studio feed throughout the vault window.','Mara Quinn remained on air and could not enter the vault.'],
      ['Bulletin Cue Tape','Lydia Shore’s cue tape and spoken bulletin run continuously.','Lydia Shore was presenting while the reel was removed.'],
      ['Catalog Scanner Log','Rafi Bell’s scanner records each shelf in order with no vault-door event.','Rafi Bell stayed in the catalog room.'],
      ['Harbor Timetable Board','The station timetable places the roof antenna repair after the inquiry window.','Evan Price’s claim that he was repairing the roof does not fit the station’s recorded schedule.'],
      ['Roof Hatch Dust','The roof hatch dust is unbroken and the repair tools remain sealed.','Evan Price never went to the roof; his claimed repair did not occur.'],
      ['Engineer Console Cache','A temporary console cache contains the deleted transmission segment.','Evan Price edited the reel from the engineer console after removing it.'],
    ],
    hints: ['A reel can be altered without taking the whole recording out of the vault.','Check the repair alibi against the roof hatch and the station’s edit history.','The missing audio begins exactly where one person’s transmission would become identifiable.'],
    explain: 'Evan Price removed and edited the reel with station splicing tape, then claimed to repair the antenna. The untouched roof hatch disproves that alibi and the console cache preserves the deleted transmission.',
  },
];

const genericVariants = [
  { id: 'generic-switchboard', kind: 'general', title: 'The Unanswered Signal', place: 'Meridian House', incident: 'A sealed dispatch connected to the submitted case vanished from Meridian House during a brief power interruption.', culprit: 'Elsie Ward', motive: 'She altered the dispatch to conceal that she had redirected a relief shipment for her own failing depot.',
    suspects: [['Gideon Shaw','House steward managing the entry ledger','He was checking the generator outside','He feared the outage would end his employment.'],['Elsie Ward','Dispatch clerk who copied the sealed message','She says she remained at the switchboard','The dispatch exposed her diversion of relief goods.'],['Noel Price','Courier waiting for the next route','A gate tally places him beyond the house','He was owed wages by the depot.'],['Mira Sol','Repairer called to inspect the alarm','Her service tag records the basement','She wanted a contract extension.'],['Otis Lane','Visitor seeking a public statement','A carriage record shows he departed early','He hoped to embarrass the house trustees.']],
    clues: [['Switchboard Carbon','A carbon strip from the dispatch book is missing its matching original.','Elsie Ward removed the dispatch after making its carbon copy.'],['Generator Fuse Note','The outage note carries the same shorthand as the dispatch clerk’s daily log.','Elsie Ward arranged the brief interruption to cover the removal.'],['Depot Route Change','A route change in Elsie Ward’s hand redirects the relief wagon.','Elsie Ward altered the dispatch to hide her diversion.'],['Gate Tally','Noel Price’s gate token was outside during the outage.','Noel Price was away from the dispatch room.'],['Generator Inspection','Gideon Shaw’s generator inspection was signed by two witnesses before the outage.','Gideon Shaw was outside during the removal and could not alter the dispatch.'],['Dispatch Desk Key Register','A spare desk key was returned after the outage with fresh paper fibers in its teeth.','Elsie Ward used the dispatch desk key while handling the missing original.'],['Relay Access Mark','Fresh graphite on the relay switch matches the clerk’s routing pencil.','Elsie Ward operated the relay and used the brief interruption to cover the removal.'],['Switchboard Dust','A freshly moved relay leaves dust on the clerk’s sleeve.','Elsie Ward operated the switchboard and disturbed the relay.'],['Depot Receipt','A receipt shows the redirected shipment reached Elsie Ward’s private depot.','Elsie Ward benefited from the changed dispatch.']],
    hints: ['Compare the dispatch carbon with the route changes.','The outage has a paper trail at the switchboard.','Check who benefited from the altered message.'], explain: 'Elsie Ward used her switchboard access to create a brief interruption, removed the dispatch and changed its route to divert the relief shipment.' },
  { id: 'generic-clocktower', kind: 'general', title: 'The Clocktower Ledger', place: 'Alderwick Hall', incident: 'A record relevant to the submitted premise disappeared from a locked office during the evening bell.', culprit: 'Felix Gray', motive: 'He removed the record to hide that he had falsified a repair and charged the estate twice.',
    suspects: [['Rosa Bell','Housekeeper responsible for the office keys','She was setting the dining room','She feared an audit would blame her for the office.'],['Felix Gray','Repair clerk who maintained the hall clock','He claims to have worked in the tower','The record documented his false repair invoice.'],['Amir Vale','Estate messenger awaiting a sealed packet','A stable hand saw him outside','He wanted a delayed payment.'],['Celia North','Accountant reviewing the quarterly books','A call record places her at the east lodge','She wanted to uncover financial misconduct.'],['Toby Finch','Bell ringer who operates the upper chamber','A bell mechanism log records his whole shift','He had argued about overtime.']],
    clues: [['Clock Grease Mark','A fresh clock grease mark appears on the office latch.','Felix Gray carried the clock grease from the tower to the office latch.'],['Duplicate Invoice Stub','A duplicate invoice bears Felix Gray’s private repair code.','Felix Gray falsified the repair record and removed its supporting entry.'],['Bell Interval Sheet','The office door opened during the minute Felix Gray claimed to be in the tower.','Felix Gray’s tower alibi conflicts with the recorded office access.'],['Dining Room Check','Rosa Bell’s dining-room checklist was countersigned before the bell.','Rosa Bell was away from the office during the incident.'],['Stable Yard Token','Amir Vale’s token was logged at the stable yard.','Amir Vale did not enter the office.'],['East Lodge Call','Celia North’s call ran through the full bell interval.','Celia North was at the east lodge.'],['Office Bell Shadow','The office window shadow crossed the bell face during the interval Felix Gray claimed to be in the tower.','Felix Gray’s location claim conflicts with the office access interval.'],['Tower Dust Trail','A fresh trail links the clock service stair with the office threshold.','Felix Gray used the tower route to enter and leave.'],['Audit Correction','A correction in the record would reverse the duplicate charge to Felix Gray.','Felix Gray had a direct financial motive to remove the record.']],
    hints: ['The clock’s timing can check a claimed location.','Trace the grease and the repair code to the person who serviced the mechanism.','The missing record concerns a payment that benefits one suspect.'], explain: 'Felix Gray left the tower during the bell interval, entered the office by the service stair and removed the record that exposed his duplicate repair charge.' },
];

export const PLAYABLE_SCENARIOS = Object.freeze([
  {
    id: 'royal-letter',
    templateId: 'royal-letter',
    title: 'The Missing Royal Letter',
    category: 'Historical Mystery',
    description: 'A confidential succession letter disappears from a sealed royal archive before the council meets.',
    premise: 'A confidential succession letter vanishes from the Aurellian Royal Archive shortly before the council convenes.',
  },
  {
    id: 'empty-compartment',
    templateId: 'missing-train-passenger',
    title: 'The Empty Compartment',
    category: 'Disappearance',
    description: 'A passenger disappears from a sleeper compartment while the North Line travels between stations.',
    premise: 'A passenger disappears from a locked sleeper compartment during a long-distance train journey.',
  },
  {
    id: 'locked-room',
    templateId: 'locked-room',
    title: 'The Locked Room',
    category: 'Locked-Room Mystery',
    description: 'A rare moon orchid vanishes from a greenhouse locked from within, with its door seal intact.',
    premise: 'A rare moon orchid disappears from a greenhouse locked from within, with the door seal intact.',
  },
  {
    id: 'missing-experiment',
    templateId: 'biological-sample-lab',
    title: 'The Missing Experiment',
    category: 'Scientific Mystery',
    description: 'A rare biological sample vanishes from a restricted research laboratory overnight.',
    premise: 'A rare biological sample vanishes from a restricted research laboratory.',
  },
  {
    id: 'museum-heist',
    templateId: 'museum-artifact',
    title: 'The Museum Heist',
    category: 'Art Theft',
    description: 'A bronze reliquary disappears from a sealed museum display during a brief blackout.',
    premise: 'A bronze reliquary disappears from a sealed museum display during a short gallery blackout.',
  },
  {
    id: 'vanishing-evidence',
    templateId: 'missing-evidence',
    title: 'The Vanishing Evidence',
    category: 'Investigation',
    description: 'A sealed forensic sample disappears from a locked evidence refrigerator before an inquiry.',
    premise: 'A sealed forensic sample disappears from a locked evidence refrigerator at the Westbridge Forensic Archive.',
  },
].map((scenario) => Object.freeze(scenario)));

function selectScenario(premise) {
  const text = premise.toLocaleLowerCase();
  const missingAction = /\b(missing|disappear\w*|vanish\w*|stol(e|en)|taken|removed|lost|abduct\w*|kidnap\w*)\b/.test(text);
  const hasPerson = /\b(passenger|travell?er|commuter|person|curator|keeper|scientist|researcher|clerk|witness|captain|conductor)\b/.test(text);

  if (missingAction && /\broyal archive\b/.test(text) &&
      /\b(succession letter|succession correspondence|succession document)\b/.test(text)) {
    return scenarios.find(({ id }) => id === 'royal-letter');
  }
  // Match the event and its subject together, so incidental words such as
  // "archive" or "disappeared" cannot override the actual case premise.
  if (/\b(train|railway|railroad|night train|sleeper car)\b/.test(text) &&
      /\b(passenger|travell?er|commuter|person)\b/.test(text) && missingAction) {
    return scenarios.find(({ id }) => id === 'missing-train-passenger');
  }

  if (/\b(biological|biologic|rare sample|tissue sample|cell sample|specimen|cryovial)\b/.test(text) &&
      /\b(research laborator\w*|laborator\w*|lab|research facility|cryogenic)\b/.test(text) && missingAction) {
    return scenarios.find(({ id }) => id === 'biological-sample-lab');
  }

  if (missingAction && hasPerson) return scenarios.find(({ id }) => id === 'missing-person');

  if (missingAction && /\b(manuscript|proof page|printing press|publisher|final page)\b/.test(text)) {
    return scenarios.find(({ id }) => id === 'missing-manuscript');
  }
  if (missingAction && /\b(recording|reel|radio station|broadcast|tape)\b/.test(text)) {
    return scenarios.find(({ id }) => id === 'missing-recording');
  }
  if (missingAction && /\b(letter|document|will|contract|deed|ledger|file|record|note|paperwork)\b/.test(text)) {
    return scenarios.find(({ id }) => id === 'missing-letter');
  }
  if (missingAction && /\b(evidence|sample|specimen|forensic|proof)\b/.test(text)) {
    return scenarios.find(({ id }) => id === 'missing-evidence');
  }
  if (missingAction && /\b(museum|artifact|antique|painting|relic|reliquary|exhibit|gallery|compass|statue|diamond)\b/.test(text)) {
    return scenarios.find(({ id }) => id === 'museum-artifact');
  }
  if (/\b(locked.?room|sealed room|locked chamber|impossible room|greenhouse)\b/.test(text)) {
    return scenarios.find(({ id }) => id === 'locked-room');
  }
  if (/\b(stol(e|en)|theft|robbery|jewel|diamond|heirloom|brooch|object)\b/.test(text)) {
    return scenarios.find(({ id }) => id === 'stolen-object');
  }
  // A stable hash spreads unrecognized premises across complete authored cases.
  let hash = 2166136261;
  for (const char of text.trim()) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return genericVariants[(hash >>> 0) % genericVariants.length];
}

export function generateTemplateMystery({ premise, difficulty }) {
  const rules = DIFFICULTY_RULES[difficulty];
  if (!rules || typeof premise !== 'string' || !premise.trim()) {
    throw new TypeError('A valid premise and difficulty are required for template generation.');
  }
  const scenario = selectScenario(premise);
  const suspects = scenario.suspects.map(([name, role, alibi, motive], index) => ({
    id: `suspect_${index + 1}`, name, description: role, alibi, motive,
  }));
  const clues = scenario.clues.map(([title, description, privateMeaning], index) => ({
    id: `clue_${index + 1}`, title, description, privateMeaning,
  }));
  const reasoning = `${scenario.clues[0][0]} and ${scenario.clues[1][0]} establish the culprit's access and method. ${scenario.clues[2][0]} establishes the motive and fixes the relevant timeline. ${scenario.clues[3][0]} and ${scenario.clues[4][0]} independently test other accounts. Additional records extend that same timeline and explain the remaining witnesses.`;
  const mystery = {
    title: scenario.title,
    story: `Submitted premise: “${premise.trim()}”\n\n${scenario.incident} The incident occurred at ${scenario.place}. Investigators must compare the recorded timeline, physical traces and witness accounts to establish who was responsible.`,
    suspects: suspects.slice(0, rules.suspects),
    clues: clues.slice(0, rules.clues),
    hints: scenario.hints.slice(0, rules.hints),
    solution: { culpritId: 'suspect_2', explanation: scenario.explain, reasoning },
  };
  return validateTemplateMysteryConsistency(mystery);
}

export function getTemplateScenarioId(premise) {
  return selectScenario(premise).id;
}

/** Assert that clue details concern a suspect or a person established in the briefing. */
export function validateTemplateMysteryConsistency(mystery) {
  const normalizeName = (name) => name.replace(/^Dr\.?\s+/i, '').toLocaleLowerCase();
  const suspectNames = mystery.suspects.map(({ name }) => normalizeName(name));
  const story = mystery.story.toLocaleLowerCase();
  const properNamePattern = /\b(?:Dr\.?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;

  for (const clue of mystery.clues) {
    const meaning = clue.privateMeaning.toLocaleLowerCase();
    if (!suspectNames.some((name) => meaning.includes(name))) {
      throw new Error(`Clue meaning does not test a listed suspect: ${clue.id}`);
    }

    const clueText = `${clue.description} ${clue.privateMeaning}`;
    for (const match of clueText.matchAll(properNamePattern)) {
      const name = normalizeName(match[1].replace(/^(?:The|A|An)\s+/i, ''));
      if (!suspectNames.includes(name) && !story.includes(name)) {
        throw new Error(`Clue mentions a person who is not established in the case: ${name}`);
      }
    }
  }
  return mystery;
}
