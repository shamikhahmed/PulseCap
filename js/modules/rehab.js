'use strict';
/* ── PulseCap — Injury Rehab Database ── */

var INJURY_DB = {
  shoulder_dislocation: {
    id:'shoulder_dislocation', name:'Shoulder Dislocation', icon:'🦴', severity:'severe',
    anatomy:'Anterior glenohumeral dislocation — humeral head displaced anteriorly from glenoid fossa. Stretches anterior capsule, labrum, and often axillary nerve.',
    mechanism:'Fall on outstretched hand (FOOSH), forceful overhead or behind-back arm movement, contact sport impact.',
    acute_phase:{ duration_weeks:2, do:['Wear sling for 1-2 weeks','Ice 20 min every 2-3 hours','Pendulum swings (gravity-assisted only)','Keep elbow at 90 degrees in sling'], avoid:['ANY overhead movement','Behind-back movements','All pressing exercises','Lifting any weight with injured arm'], exercises_ok:['Pendulum circles','Elbow flexion/extension','Hand grip squeezes'], exercises_avoid:['Bench press','Overhead press','Pull-ups','Rows','Push-ups'] },
    subacute_phase:{ duration_weeks:6, do:['Passive then active ROM exercises','Scapular retractions','Isometric then isotonic rotator cuff','Progress to light resistance band work','Postural exercises'], avoid:['Overhead pressing','Barbell bench press','Behind-neck movements','Wide-grip upright rows'], exercises_ok:['Band external rotation','Scapular retractions','Wall slides','Side-lying external rotation'], exercises_avoid:['Barbell bench press','Overhead press barbell','Dips'] },
    remodeling_phase:{ duration_weeks:8, do:['Progressive rotator cuff strengthening','Light dumbbell pressing (below shoulder height)','Full ROM movements with control','Proprioception and neuromuscular training'], avoid:['Behind-neck press (permanently contraindicated)','Wide-grip upright rows (permanently contraindicated)','Contact sports until medically cleared'], exercises_ok:['Light DB bench press','Face pulls','Rear delt work','Cable external rotation'], exercises_avoid:['Behind-neck press','Wide upright rows'] },
    return_to_gym_weeks:{ optimistic:12, typical:16, conservative:24 },
    red_flags:['Numbness or tingling down the arm (axillary nerve damage)','Unable to lift arm at all after 2 weeks','Recurrent dislocation events','Significant swelling that does not reduce within 48 hours','Visible deformity that persists'],
    evidence_source:'Kearney et al BMJ 2024 — 40-90% recurrence rate in under-25s. Surgical stabilisation often recommended for young athletes after first dislocation.'
  },

  ankle_sprain_mild: {
    id:'ankle_sprain_mild', name:'Ankle Sprain (Grade 1-2)', icon:'🦶', severity:'mild',
    anatomy:'Lateral ankle ligament sprain — partial or micro-tear of anterior talofibular ligament (ATFL) and/or calcaneofibular ligament (CFL). Grade 1: stretch only. Grade 2: partial tear.',
    mechanism:'Inversion (rolling) of ankle, landing from jump, uneven surface. Most common sports injury.',
    acute_phase:{ duration_weeks:1, do:['PRICE protocol: Protect, Rest, Ice (20min on/off), Compress, Elevate','Partial weight bearing as tolerated','Single-leg balance exercises (pain-free)','Ankle alphabet exercises'], avoid:['Running or jumping','Aggressive stretching','Full weight bearing if painful','High heels or unstable footwear'], exercises_ok:['Seated calf raises','Ankle circles','Towel scrunches'], exercises_avoid:['Running','Jumping','Box jumps','Heavy leg press'] },
    subacute_phase:{ duration_weeks:3, do:['Progressive loading — walking then jogging','Calf raises (double then single leg)','Proprioception drills (wobble board, single-leg stance)','Resistance band strengthening (all planes)'], avoid:['Running at full speed','Cutting and pivoting movements','Heavy loaded squats if ankle unstable'], exercises_ok:['Calf raises','Single-leg balance','Band eversion/inversion','Stationary bike'], exercises_avoid:['Sprint running','Lateral cutting','Plyometric jumps'] },
    remodeling_phase:{ duration_weeks:2, do:['Return to full loading','Plyometrics and change of direction','Sport-specific training','Proprioception maintenance'], avoid:['No permanent restrictions for Grade 1-2 if rehab complete'], exercises_ok:['Full squat','Running','Box jumps','Sport-specific drills'], exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:1, typical:3, conservative:5 },
    red_flags:['Unable to weight-bear at all (may be Grade 3 or fracture)','Bony tenderness over fibula or navicular (Ottawa Rules — possible fracture)','Significant swelling and bruising','Numbness in foot'],
    evidence_source:'Ottawa Ankle Rules — high sensitivity for ruling out fractures. PRICE + progressive loading evidence-based (van den Bekerom et al, British Journal of Sports Medicine).'
  },

  ankle_sprain_severe: {
    id:'ankle_sprain_severe', name:'Ankle Sprain (Grade 3)', icon:'🦶', severity:'moderate',
    anatomy:'Complete rupture of lateral ankle ligaments (ATFL + CFL, sometimes PTFL). Significant joint instability.',
    mechanism:'Severe inversion force, often with audible pop and immediate inability to weight-bear.',
    acute_phase:{ duration_weeks:2, do:['PRICE protocol strictly for 48-72 hours','Boot or cast immobilisation 1-3 weeks','No weight bearing initially','Ice and elevation aggressively'], avoid:['All weight bearing until pain allows','Any ankle inversion loading','Running or sport'], exercises_ok:['Upper body training (seated)','Pool walking when swelling reduces'], exercises_avoid:['All lower body loading','Running','Squats','Leg press (initially)'] },
    subacute_phase:{ duration_weeks:5, do:['Gradual progressive loading under physio guidance','Proprioception training critical (recurrence prevention)','Calf strengthening — eccentric emphasis','Neuromuscular training'], avoid:['High impact loading','Cutting/pivoting until stable','Ladder drills early on'], exercises_ok:['Stationary bike','Calf raises','Single-leg balance','Band exercises'], exercises_avoid:['Running','Jumping','Heavy squats'] },
    remodeling_phase:{ duration_weeks:5, do:['Sport-specific loading','Plyometrics progression','Ankle brace/taping for return to sport (6-12 months)','Ongoing proprioception work'], avoid:['Ankle bracing is recommended long-term to prevent recurrence'], exercises_ok:['Full gym training','Running','Jumping'], exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:6, typical:10, conservative:16 },
    red_flags:['Inability to weight bear at all','Significant instability on standing','Bony tenderness (Ottawa Rules — fracture concern)','Neurovascular compromise'],
    evidence_source:'Vuurberg et al BJSM 2018 — Grade 3 rehabilitation guidelines. Proprioception training reduces re-sprain risk by 50%.'
  },

  herniated_disc: {
    id:'herniated_disc', name:'Herniated Disc (Lumbar)', icon:'🦴', severity:'moderate',
    anatomy:'Nucleus pulposus (disc gel centre) protrudes through annulus fibrosus, potentially compressing nerve roots. Most common at L4-L5 and L5-S1.',
    mechanism:'Repetitive spinal flexion under load, sudden heavy lift with poor form, prolonged sitting with poor posture. Often gradual onset.',
    acute_phase:{ duration_weeks:4, do:['Walking — best early intervention','McKenzie extension exercises (prone press-ups)','Avoid prolonged sitting','Ice or heat for pain management','Continue daily activities as tolerated'], avoid:['ALL loaded spinal flexion','Deadlifts and squats with axial load','Sit-ups and crunches','Leg press (compressive)','Prolonged sitting'], exercises_ok:['Walking','Prone press-ups (McKenzie)','Pelvic tilts','Side-lying rest position'], exercises_avoid:['Deadlift','Squat','Good morning','Leg press','Sit-ups','Crunches','Loaded carries'] },
    subacute_phase:{ duration_weeks:8, do:['McGill Big 3: bird-dog, modified curl-up, side plank','Hip hinging pattern practice (neutral spine)','Light Romanian deadlift (if pain-free)','Swimming or pool therapy','Gradual return to gym (upper body first)'], avoid:['Loaded spinal flexion — permanent vigilance required','Heavy axial loading (barbell squat/deadlift) until fully pain-free','Running on hard surfaces early'], exercises_ok:['Bird-dog','Side plank','Modified curl-up','Light RDL','Swimming','Upper body pressing/pulling'], exercises_avoid:['Barbell squat','Barbell deadlift (heavy)','Kettlebell swings (early)','Leg press (acute)'] },
    remodeling_phase:{ duration_weeks:8, do:['Gradual return to compound lifts with perfect form','Bracing technique mastery','Consistent core stability work','Monitor for symptom flares and adjust load'], avoid:['Loaded spinal flexion under fatigue','Never train through radiating leg pain (nerve compression sign)'], exercises_ok:['Full deadlift (progressive)','Back squat','Romanian deadlift','All compound lifts with bracing'], exercises_avoid:['Loaded good mornings with excessive range','Kyphotic loaded movements'] },
    return_to_gym_weeks:{ optimistic:6, typical:12, conservative:24 },
    red_flags:['Bowel or bladder dysfunction (cauda equina syndrome — EMERGENCY)','Progressive neurological weakness in leg','Saddle anaesthesia (numbness between legs)','Unrelenting pain despite rest'],
    evidence_source:'80% of lumbar disc herniations resolve conservatively within 6-12 weeks (Saal & Saal, Spine 1989). McGill Big 3 protocol: Stuart McGill, University of Waterloo.'
  },

  rotator_cuff_tear: {
    id:'rotator_cuff_tear', name:'Rotator Cuff Tear (Partial)', icon:'💪', severity:'moderate',
    anatomy:'Partial thickness tear of rotator cuff — most commonly supraspinatus tendon. Causes pain with overhead movement and night pain. Full tears may require surgery.',
    mechanism:'Acute: forceful overhead movement or fall. Chronic: repetitive overhead loading, shoulder impingement, age-related degeneration.',
    acute_phase:{ duration_weeks:3, do:['PRICE protocol for acute onset','Pendulum exercises (gravity-assisted)','Avoid provocative positions','Anti-inflammatory management (ice)','Postural correction'], avoid:['ALL overhead loading','Bench press and push-ups','Pull-ups and rows with pain','Sleeping on affected shoulder'], exercises_ok:['Pendulum swings','Elbow and wrist exercises','Scapular retractions (pain-free)'], exercises_avoid:['Overhead press','Pull-ups','Bench press','Push-ups','Upright rows'] },
    subacute_phase:{ duration_weeks:6, do:['Isometric rotator cuff exercises','Isotonic band external/internal rotation','Scapular stabilisation exercises','Avoid impingement positions (arm across body at 90 deg)'], avoid:['Overhead pressing','Behind-neck movements','Upright rows','Wide-grip movements'], exercises_ok:['Side-lying external rotation','Band external rotation','Scapular Y, T, W exercises','Face pulls'], exercises_avoid:['All overhead pressing','Pull-ups (until pain-free)','Bench press (modify to dumbbells)'] },
    remodeling_phase:{ duration_weeks:8, do:['Progressive overhead pressing with careful monitoring','Rotator cuff strengthening to full range','Full gym return with technique modification','Face pulls and rear delt work permanently in routine'], avoid:['Behind-neck press (permanently)','Wide-grip upright rows (permanently)','Overhead pressing to failure'], exercises_ok:['Full pressing protocol','Pull-ups','Overhead press (dumbbells first)'], exercises_avoid:['Behind-neck press','Wide upright rows','Extreme range overhead (initially)'] },
    return_to_gym_weeks:{ optimistic:6, typical:12, conservative:26 },
    red_flags:['Complete loss of shoulder strength (possible full tear)','Night pain that severely disrupts sleep','No improvement after 6 weeks conservative management','Arm goes numb or weak'],
    evidence_source:'Ainsworth & Lewis, BMJ 2007 — 66-90% of partial RC tears respond to conservative management. Full tear: surgical repair then 6-9 month rehab.'
  },

  patellar_tendinitis: {
    id:'patellar_tendinitis', name:'Patellar Tendinopathy', icon:'🦵', severity:'mild',
    anatomy:'Degenerative changes or micro-tearing of the patellar tendon (inferior pole of patella). AKA "jumper\'s knee." Most common in volleyball, basketball, weightlifting.',
    mechanism:'Repetitive loading of knee extensor mechanism — jumping, landing, heavy squatting. Sudden load increase is key risk factor.',
    acute_phase:{ duration_weeks:2, do:['Load reduction — reduce training volume 50-70%','Ice post-exercise (not before)','Isometric knee extension (5x45s wall sit) — immediate pain relief','Avoid activities that provoke pain above 3/10'], avoid:['Deep squats past 90 degrees','Running and jumping','Stairs with heavy load','Kneeling with force'], exercises_ok:['Wall sit (isometric)','Swimming','Cycling (low resistance)','Upper body training'], exercises_avoid:['Box jumps','Heavy squat','Running','Stairs with load'] },
    subacute_phase:{ duration_weeks:8, do:['Alfredson eccentric protocol: decline squat 3x15 twice daily at 70% pain threshold','Heavy slow resistance (HSR): 4x6 at high load with 3s eccentric','Progressive loading — pain up to 5/10 during exercise is acceptable'], avoid:['Jumping and impact before strength base is established','Sudden volume spikes'], exercises_ok:['Decline squats (eccentric)','Leg press (slow tempo)','Romanian deadlift','Step-ups'], exercises_avoid:['Drop jumps','Sprint running','Box jumps (until 3+ months)'] },
    remodeling_phase:{ duration_weeks:6, do:['Return to full loading with maintenance HSR program','Jump training graded introduction (single-leg before double)','Sports-specific loading with continued tendon loading'], avoid:['Abandoning loading program — tendons need continued stimulus'], exercises_ok:['Full squat','Jumping (graded)','Running (graded)','All sport training'], exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:6, typical:12, conservative:24 },
    red_flags:['Complete rupture — acute inability to extend knee and palpable gap in tendon','Rapid progressive worsening despite load reduction','Significant swelling and heat'],
    evidence_source:'Alfredson et al 1998 heavy eccentric loading protocol. Bohm et al BJSM 2015 — HSR equally effective. VISA-P questionnaire for monitoring.'
  },

  acl_tear: {
    id:'acl_tear', name:'ACL Tear (Post-Surgery)', icon:'🦵', severity:'severe',
    anatomy:'Complete rupture of anterior cruciate ligament — primary restraint to anterior tibial translation. ACL reconstruction typically uses hamstring graft or patellar tendon graft.',
    mechanism:'Non-contact: deceleration, pivoting, landing from jump. Contact: direct blow to knee. Heard/felt a pop, immediate swelling.',
    acute_phase:{ duration_weeks:2, do:['PRICE protocol post-injury/post-op','Quad sets (isometric quads on flat surface)','Straight leg raises','Heel slides for ROM','Weight bear as pain allows post-op'], avoid:['Full weight bearing without crutches initially','Knee flexion past 90 degrees (weeks 0-4)','Any pivoting or rotational force on knee','All sport'], exercises_ok:['Quad sets','Heel slides','Ankle pumps','Straight leg raises','Upper body training (seated)'], exercises_avoid:['Squats','Leg press','All lower body loaded exercises','Running'] },
    subacute_phase:{ duration_weeks:14, do:['Closed kinetic chain exercises (leg press, squat) from week 4','Open chain (leg extension) only after week 12 (controversial — discuss with physio)','Proprioception training from week 6','Cycling from week 6-8','Swimming from week 8-12','Running not before week 12-16'], avoid:['Pivoting and cutting — NO sport until 9+ months','Running before 3 months post-op','Any sudden rotational load'], exercises_ok:['Leg press (controlled)','Cycling','Swimming','Squat (progressive depth)','Hip exercises'], exercises_avoid:['Running (pre-3 months)','Pivoting sport','Jump training (pre-6 months)'] },
    remodeling_phase:{ duration_weeks:22, do:['Limb symmetry index >90% before return to sport','Hop tests to assess readiness','Strength testing — quad and hamstring symmetry','Graded plyometric and running programme','Minimum 9 months return to sport — 18-24 months ideal for contact sport'], avoid:['Return before strength symmetry established','Contact sport before 12 months minimum'], exercises_ok:['Full gym training','Running programme','Jumping (progressive)','Sport-specific drills'], exercises_avoid:['Full contact sport (pre-9 months)','Pivoting drills (pre-9 months)'] },
    return_to_gym_weeks:{ optimistic:24, typical:36, conservative:52 },
    red_flags:['Failure of graft (re-injury pop)','Progressive loss of extension (arthrofibrosis)','Significant swelling post-exercise that does not resolve','Knee giving way during activities of daily living'],
    evidence_source:'Grindem et al BJSM 2016 — each month delay in return to sport reduces re-injury risk by 51%. Ideal return at 18-24 months for contact sports (ACL Study Group 2024).'
  },

  tennis_elbow: {
    id:'tennis_elbow', name:'Tennis Elbow (Lateral Epicondylitis)', icon:'💪', severity:'mild',
    anatomy:'Degenerative tendinopathy of extensor carpi radialis brevis (ECRB) at the lateral epicondyle of humerus. Repetitive gripping and wrist extension overload.',
    mechanism:'Repetitive gripping under load, wrist extension movements. Common in tennis, weightlifting (barbell rows, pull-ups with supination), racquet sports.',
    acute_phase:{ duration_weeks:2, do:['Activity modification — avoid provocative gripping movements','Eccentric wrist extensions (Tyler Twist with Theraband, 3x15 daily)','Ice post-exercise','Counterforce brace during activities'], avoid:['Gripping under heavy load','Barbell rows with supinated grip','Heavy bicep curls','Wrist extension under load'], exercises_ok:['Lower body exercises','Push-ups (if pain-free)','Leg work','Core work'], exercises_avoid:['Barbell rows (supinated)','Heavy dumbbell curls','Wrist curls','Reverse curls'] },
    subacute_phase:{ duration_weeks:8, do:['Tyler Twist protocol (Theraband Flexbar) — 3x15 twice daily','Progressive grip strengthening — low load high rep','Wrist and forearm strengthening in all planes','Assess and correct technique in lifting'], avoid:['Heavy gripping under load until pain-free','Repetitive wrist extension under load'], exercises_ok:['Tyler Twist','Hammer curls (light)','Wrist curls (light)','Forearm pronation/supination'], exercises_avoid:['Heavy barbell rows (supinated)','Wrist rollers under load'] },
    remodeling_phase:{ duration_weeks:6, do:['Full return to grip training with progressive load','Maintenance eccentric program 3x/week','Technique review to prevent recurrence'], avoid:['Abrupt load increases in grip-intensive exercises'], exercises_ok:['Full barbell and dumbbell training','Pull-ups','All exercises'], exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:6, typical:10, conservative:24 },
    red_flags:['Numbness or tingling in ring/little finger (radial tunnel vs cubital tunnel)','Inability to fully extend elbow (loose body)','Night pain unrelated to position'],
    evidence_source:'Stasinopoulos & Johnson, BJSM 2006 — Tyler Twist (Theraband Flexbar) eccentric protocol: 3x15 twice daily, clinically validated.'
  },

  golfers_elbow: {
    id:'golfers_elbow', name:"Golfer's Elbow (Medial Epicondylitis)", icon:'💪', severity:'mild',
    anatomy:'Degenerative tendinopathy of wrist flexor-pronator muscle group at medial epicondyle. Affects FCR, FCU, palmaris longus origin.',
    mechanism:'Repetitive wrist flexion and forearm pronation under load. Common in golf, overhead throwing, pull-up variations, and heavy rows.',
    acute_phase:{ duration_weeks:2, do:['Activity modification for provocative movements','Eccentric wrist flexion exercises (3x15 slowly lowering weight)','Ice post-exercise','Medial counterforce brace during activity'], avoid:['Heavy overhead pressing with poor mechanics','Heavy dumbbell and barbell rows (acute phase)','Gripping heavy loads'], exercises_ok:['Lower body training','Leg work','Core work (no grip)'], exercises_avoid:['Heavy rows','Overhead press (heavy)','Pull-ups (acute)','Wrist curls under heavy load'] },
    subacute_phase:{ duration_weeks:8, do:['Eccentric wrist flexion protocol — slow 3-second descent','Progressive forearm strengthening','Pronation/supination exercises','Grip strengthening (low load, high rep)'], avoid:['Repetitive heavy wrist flexion under load','Throwing and swinging movements with pain'], exercises_ok:['Wrist curls (light eccentric)','Forearm pronation/supination','Hammer curls','Pull-ups (if pain-free)'], exercises_avoid:['Heavy rows (acute)','Barbell wrist curls (heavy)'] },
    remodeling_phase:{ duration_weeks:6, do:['Full return to gym training','Maintenance eccentric program 3x/week','Address any technique issues (pull-up grip, row form)'], avoid:['Abrupt load increases in grip-heavy sessions'], exercises_ok:['All exercises'],exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:6, typical:12, conservative:26 },
    red_flags:['Ulnar nerve symptoms — tingling in ring and little finger (cubital tunnel syndrome)','Elbow instability (medial collateral ligament involvement)','Significant loss of grip strength'],
    evidence_source:'Ciccotti et al, American Journal of Sports Medicine — eccentric loading protocols effective in 88% of cases. Cubital tunnel syndrome must be excluded if nerve symptoms present.'
  },

  bicep_tendon_tear: {
    id:'bicep_tendon_tear', name:'Bicep Tendon Tear (Distal)', icon:'💪', severity:'severe',
    anatomy:'Partial or complete rupture of distal biceps tendon at radial tuberosity. Complete tears produce visible deformity (Popeye sign) and significant loss of supination strength.',
    mechanism:'Sudden eccentric load with elbow flexed — catching heavy object, failed heavy curl, or dumbbell lowering under load.',
    acute_phase:{ duration_weeks:2, do:['Sling for 1-2 weeks','No elbow loading whatsoever','Ice and elevation','Surgical consultation for complete tear (surgery within 2-3 weeks gives best outcomes)'], avoid:['All elbow flexion loading','Carrying anything with affected arm','Supination loading'], exercises_ok:['Lower body training (no upper body grip)'], exercises_avoid:['All bicep exercises','Pull-ups','Rows','Any carrying'] },
    subacute_phase:{ duration_weeks:6, do:['Post-surgical: physiotherapy-directed protocol','Passive ROM first (weeks 2-6)','Progressive resistance from weeks 6-12','Focus on supination strength recovery'], avoid:['Heavy loading until 12 weeks minimum','Resisted supination before week 8'], exercises_ok:['Gentle passive ROM','Lower body training','Core work'], exercises_avoid:['Any bicep or forearm loading (heavy)','Pull-ups before week 12'] },
    remodeling_phase:{ duration_weeks:12, do:['Progressive return to curls and pulling movements','Supination-specific exercises','Grip strengthening','Return to full training by month 6'], avoid:['Maximal effort supination before month 6'], exercises_ok:['Full upper body training progressively','Pull-ups','Rows','Curls (progressive load)'], exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:12, typical:20, conservative:32 },
    red_flags:['Visible Popeye deformity (complete tear — needs urgent surgical assessment)','Complete loss of supination strength','Significant bruising tracking down forearm','Failure to improve with conservative management (partial tear)'],
    evidence_source:'Chillemi et al, JBJS — surgical repair of complete distal bicep tear recommended within 2-3 weeks of injury for best supination strength recovery.'
  },

  meniscus_tear: {
    id:'meniscus_tear', name:'Meniscus Tear (Knee)', icon:'🦵', severity:'moderate',
    anatomy:'Tear of medial or lateral fibrocartilage meniscus. Medial tears more common. Range from minor (bucket-handle not displaced) to complex. Outer third has blood supply — heals better.',
    mechanism:'Rotational force on flexed knee, deep squat, or degenerative tearing (older athletes). Often occurs with ACL injury.',
    acute_phase:{ duration_weeks:2, do:['PRICE protocol','Crutches if significant pain on weight-bearing','Gentle ROM exercise (heel slides)','Quad activation exercises','MRI to confirm diagnosis and extent'], avoid:['Deep squats','Heavy leg press','Twisting and pivoting','Running'], exercises_ok:['Heel slides','Quad sets','Straight leg raises','Upper body training'], exercises_avoid:['Deep squat','Leg press (deep)','Running','Pivoting sport'] },
    subacute_phase:{ duration_weeks:4, do:['Progressive loading — squat to pain-free depth only','Stationary bike (excellent for meniscus health)','Swimming','Leg press to 90 degrees','Proprioception training'], avoid:['Deep flexion under load','High impact loading','Twisting with load'], exercises_ok:['Cycling','Swimming','Leg press (0-90 deg)','Partial squats','Hip exercises'], exercises_avoid:['Deep squat','Heavy leg press full range','Running (early)'] },
    remodeling_phase:{ duration_weeks:8, do:['Post-surgical: physiotherapy-guided protocol','Full gym return by month 3 (minor tear) or month 6 (surgical repair)','Squat depth progressively increased','Maintain proprioception work'], avoid:['Deep loaded squats (surgical repair) before 6 months'], exercises_ok:['Full gym training (minor tears)','Progressive squat depth','Running (graded)'], exercises_avoid:['Heavy pivot sports before 6 months (surgical)'] },
    return_to_gym_weeks:{ optimistic:4, typical:8, conservative:24 },
    red_flags:['Locked knee — unable to fully extend (bucket-handle tear — URGENT)','Significant effusion that does not resolve','Giving way episodes','Progressive loss of extension or flexion'],
    evidence_source:'Katz et al NEJM 2013 — exercise therapy comparable to surgery for degenerative meniscus tears. Surgical repair required for locked knee or complete bucket-handle tears.'
  },

  hamstring_strain: {
    id:'hamstring_strain', name:'Hamstring Strain (Grade 1-2)', icon:'🦵', severity:'mild',
    anatomy:'Partial muscle tear most commonly at proximal musculotendinous junction of biceps femoris long head. Grade 1: minor tear. Grade 2: significant partial tear with bruising.',
    mechanism:'High-speed running (late swing phase), rapid eccentric loading, inadequate warm-up, fatigue.',
    acute_phase:{ duration_weeks:1, do:['PRICE protocol — no aggressive stretching for 48-72 hours','Gentle isometric hamstring contractions (pain-free)','Maintain upper body and quad/calf training','Walking as tolerated'], avoid:['Aggressive hamstring stretching (acutely — tears more fibres)','Sprint running','Heavy Romanian deadlift','Nordic curls in acute phase'], exercises_ok:['Isometric hamstring squeeze','Cycling (low resistance)','Upper body training','Quad exercises'], exercises_avoid:['Sprint running','Deadlift','Nordic curl (acute)','Deep hip flexion under load'] },
    subacute_phase:{ duration_weeks:4, do:['Progressive loading — start with isometric, then concentric, then eccentric','Nordic hamstring curl (best evidence — reduces re-injury 50%)','Romanian deadlift (progressive load)','Running progression: jog, then tempo, then sprints'], avoid:['Sprint running until Grade 2 pain-free at jog','Sudden increase in eccentric load volume'], exercises_ok:['Nordic curl (progressive)','Romanian deadlift','Leg curl','Cycling','Jogging (Grade 1 early, Grade 2 later)'], exercises_avoid:['Sprint running (Grade 2 — weeks 2-4)','Deep hip flexion under load'] },
    remodeling_phase:{ duration_weeks:3, do:['Full sprint return with graded acceleration work','Sport-specific training','Maintain nordic curl program long-term (injury prevention)'], avoid:['Neglecting maintenance program — high re-injury rate'], exercises_ok:['Full training','Sprint running','All exercises'], exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:1, typical:4, conservative:7 },
    red_flags:['Palpable gap at proximal hamstring (complete avulsion — URGENT)','Severe bruising tracking into buttock','Unable to walk 48 hours after injury','Sciatic nerve symptoms (tingling down leg)'],
    evidence_source:'Petersen et al AJSM 2011 — Nordic hamstring curl reduces hamstring injury rate by 51% in football players. Askling criteria for return to sprint training.'
  },

  quad_strain: {
    id:'quad_strain', name:'Quadriceps Strain', icon:'🦵', severity:'mild',
    anatomy:'Partial tear of quadriceps — most commonly rectus femoris (biarticular) at the musculotendinous junction. Grade 1-3 severity.',
    mechanism:'Sudden acceleration, kicking, rapid knee extension against resistance. Direct blow to anterior thigh (contusion may accompany).',
    acute_phase:{ duration_weeks:1, do:['PRICE protocol','Gentle knee flexion ROM (to comfortable range)','Isometric quad contractions (pain-free)','Maintain upper body and hamstring training'], avoid:['Lunges and split squats','Heavy leg press','Sprinting and kicking','Aggressive stretching acutely'], exercises_ok:['Isometric quad set','Hip extension exercises','Upper body training','Swimming'], exercises_avoid:['Squat','Lunge','Leg press (initially)','Sprint running'] },
    subacute_phase:{ duration_weeks:4, do:['Progressive concentric loading — leg press, squat','Eccentric loading introduction (slow tempo squats)','Cycling (excellent for quad rehab)','Running progression when full ROM restored'], avoid:['High impact loading before full ROM','Maximal sprint before 4 weeks'], exercises_ok:['Leg press','Squat (progressive)','Cycling','Step-ups'], exercises_avoid:['Sprint running (weeks 1-3)','Plyometric jumps (weeks 1-3)'] },
    remodeling_phase:{ duration_weeks:3, do:['Full squat and leg press return','Plyometrics and jumping','Sprint work graded','Return to sport-specific training'], avoid:['Myositis ossificans risk — do not aggressively massage quad within first 3 weeks'], exercises_ok:['Full training','Sprinting','Jumping'], exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:2, typical:5, conservative:8 },
    red_flags:['Palpable defect or visible deformity (complete tear)','Unable to actively extend knee against gravity','Rapidly expanding haematoma (compartment syndrome risk)','Bone tenderness (stress fracture)'],
    evidence_source:'Lovell BJSM 2006 — myositis ossificans (bone formation in muscle) complicates ~9% of severe quad contusions. Avoid aggressive early massage.'
  },

  lower_back_strain: {
    id:'lower_back_strain', name:'Lower Back Strain', icon:'🦴', severity:'mild',
    anatomy:'Acute strain of erector spinae, QL, or other paraspinal muscles. NOT disc pathology. Typically resolves fully within 2-4 weeks. Most common musculoskeletal presentation.',
    mechanism:'Sudden movement, heavy lift with poor form, prolonged posture, or simple movement. Often occurs at end of fatigued workout.',
    acute_phase:{ duration_weeks:1, do:['STAY ACTIVE — bed rest makes it worse','Walking is best medicine','McKenzie extension (prone press-ups) if comfortable','Ice or heat for symptom relief','McGill curl-up if tolerated'], avoid:['Heavy loaded spinal movements','Deadlift and squat with axial load','Sit-ups and crunches in acute phase','Prolonged bed rest'], exercises_ok:['Walking','Gentle McKenzie extension','Upper body seated work','Cycling (upright)'], exercises_avoid:['Deadlift','Squat with barbell','Heavy carries','Good mornings'] },
    subacute_phase:{ duration_weeks:2, do:['McGill Big 3: bird-dog, side plank, modified curl-up','Return to gym — upper body and lower body without axial load','Gradual return to compound lifts with lighter weights','Hip hinge pattern retraining'], avoid:['Rushing return to heavy deadlifts or squats','Ignoring movement quality'], exercises_ok:['Leg press (moderate)','Romanian deadlift (light)','McGill Big 3','Full upper body'], exercises_avoid:['Heavy barbell deadlift (weeks 1-2)','Olympic lifting'] },
    remodeling_phase:{ duration_weeks:2, do:['Full return to compound lifts with perfect form','Consistent core stability maintenance work','Address any mobility deficits that contributed'], avoid:['Training through sharp or radiating pain'], exercises_ok:['Full training including deadlift and squat'], exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:1, typical:2, conservative:4 },
    red_flags:['Radiating leg pain past knee (disc involvement likely)','Bowel or bladder symptoms (cauda equina — EMERGENCY)','Fever with back pain (infection)','Night pain that wakes from sleep','History of cancer (metastasis possible)'],
    evidence_source:'Pengel et al BMJ 2003 — acute LBP: 90% improve within 6 weeks. Activity better than rest (Malmivaara et al NEJM 1995). Avoid medicalisation of acute LBP.'
  },

  hip_flexor_strain: {
    id:'hip_flexor_strain', name:'Hip Flexor Strain (Iliopsoas)', icon:'🦵', severity:'mild',
    anatomy:'Partial tear of iliopsoas (psoas major + iliacus) or rectus femoris at its origin. Felt as deep anterior hip or groin pain with hip flexion.',
    mechanism:'Explosive hip flexion (sprint start, kicking), sudden acceleration, overstriding in running.',
    acute_phase:{ duration_weeks:1, do:['PRICE protocol','Rest from hip flexion loading','Gentle prone hip extension stretching','Maintain upper body and calf training'], avoid:['Squats and lunges (hip flexion under load)','Running','Leg raises and hanging exercises'], exercises_ok:['Upper body training','Calf raises','Gentle hip extension stretch','Gentle walking'], exercises_avoid:['Squat','Lunge','Leg raise','Sprint running','Rowing machine'] },
    subacute_phase:{ duration_weeks:3, do:['Progressive hip flexor strengthening — isometric first','Lunge with reduced depth','Cycling (low resistance)','Running progression: walk, jog, run'], avoid:['Aggressive hip flexor stretching acutely','Explosive hip flexion before 3-4 weeks'], exercises_ok:['Stationary bike','Partial lunge','Hip flexion (light band)','Jogging (Grade 1 only)'], exercises_avoid:['Sprint starts','Deep lunge','Heavy squat (weeks 1-2)'] },
    remodeling_phase:{ duration_weeks:2, do:['Full lunge and squat return','Running and sprint progression','Explosive hip flexion exercises'], avoid:['No permanent restrictions if fully rehabilitated'], exercises_ok:['Full training including squats, lunges, sprinting'], exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:2, typical:4, conservative:6 },
    red_flags:['Snapping with pain (iliopsoas tendon may be involved)','Groin pain with testicular/ovarian radiation (exclude other causes)','Unable to walk pain-free after 1 week'],
    evidence_source:'Philippon et al — iliopsoas tendinopathy vs strain distinction important. Persistent snapping hip may indicate tendon involvement requiring specific therapy.'
  },

  groin_strain: {
    id:'groin_strain', name:'Groin Strain (Adductor)', icon:'🦵', severity:'mild',
    anatomy:'Partial tear of adductor longus (most common) or adductor magnus, brevis, or gracilis. Inner thigh pain with hip adduction and resistance.',
    mechanism:'Rapid change of direction, wide stance movements, kicking. High risk in football, hockey, rugby. Sudden stretch of adductors.',
    acute_phase:{ duration_weeks:1, do:['PRICE protocol','Avoid hip abduction loading','Gentle walking','Isometric adductor squeeze (ball between knees, 3x10)'], avoid:['Wide-stance movements (sumo squat, wide lunges)','Lateral movements','Kicking and pivoting'], exercises_ok:['Isometric adductor squeeze','Upper body training','Narrow stance squat (pain-free)'], exercises_avoid:['Sumo squat','Wide lunge','Lateral band walks','All kicking/pivoting'] },
    subacute_phase:{ duration_weeks:4, do:['Copenhagen adductor exercises (best evidence for adductor strength)','Progressive adductor loading','Side plank with adductor emphasis','Running progression when pain-free'], avoid:['Wide-stance heavy loading before pain-free','Rapid change of direction before 4+ weeks'], exercises_ok:['Copenhagen plank','Adductor machine (progressive)','Side-lying hip adduction','Cycling'], exercises_avoid:['Wide sumo movements (weeks 1-2)','Lateral cutting (pre-4 weeks)'] },
    remodeling_phase:{ duration_weeks:2, do:['Full adductor strength return','Sport-specific loading including lateral movements','Maintain Copenhagen exercise program long-term'], avoid:['No permanent restrictions when fully recovered'], exercises_ok:['Full training including sumo squat','All lateral movements'], exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:2, typical:4, conservative:7 },
    red_flags:['Sports hernia if pubic pain persists (differs from muscle strain)','Unable to walk without pain at 48 hours','Bilateral groin pain (osteitis pubis consideration)'],
    evidence_source:'Harting et al — Copenhagen adductor exercise reduces adductor injury rate by 41% (Engebretsen et al, BJSM 2008). KEY injury prevention exercise.'
  },

  achilles_tendinopathy: {
    id:'achilles_tendinopathy', name:'Achilles Tendinopathy', icon:'🦶', severity:'mild',
    anatomy:'Degenerative changes in Achilles tendon fibres — mid-portion (2-6cm above heel) or insertional. NOT an inflammatory condition — pain in Achilles with loading.',
    mechanism:'Repetitive loading, sudden training volume increase, tight calves, pronation, change in footwear. Common in runners and weightlifters doing calf work.',
    acute_phase:{ duration_weeks:2, do:['Load modification — reduce calf loading 50-70%','Isometric calf raises (5x45s, heavy) — immediate pain relief effect','Continue gym training (upper body, non-impact lower body)','Ice post-exercise (not before)'], avoid:['Complete rest (makes tendons worse)','Explosive jumping and sprinting','Steep hill running','Stretching tendon aggressively (reduces load capacity)'], exercises_ok:['Isometric calf press (leg press)','Cycling','Swimming','All upper body work'], exercises_avoid:['Box jumps','Sprint running','Jump rope','Steep incline running'] },
    subacute_phase:{ duration_weeks:10, do:['Alfredson heavy eccentric calf protocol: 3x15 twice daily (heel drops off step)','Progress to heavy slow resistance (HSR): seated and standing calf raise, slow tempo','Increase load weekly — tendons need progressive overload'], avoid:['Stretching the Achilles tendon (counterproductive)','Sudden return to sprinting or jumping'], exercises_ok:['Eccentric heel drops','Seated calf raise','Standing slow calf raise','Cycling'], exercises_avoid:['Explosive jumping (pre-8 weeks)','Sprint running (pre-8 weeks)'] },
    remodeling_phase:{ duration_weeks:10, do:['Graded return to running (Couch to 5K-style)','Plyometric loading reintroduction','Maintain HSR calf program 3x/week permanently'], avoid:['Abandoning loading program — tendons require continuous stimulus'], exercises_ok:['Running (graded)','Jumping (graded)','Full calf training','All gym work'], exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:8, typical:16, conservative:26 },
    red_flags:['Complete rupture — acute pop, inability to plantarflex, positive Thompson test (EMERGENCY — surgical decision needed)','Insertional pain that does not respond after 3 months (bursitis may coexist)'],
    evidence_source:'Alfredson et al 1998 — eccentric loading gold standard. Beyer et al AJSM 2015 — HSR equally effective and more sustainable. Never stretch an Achilles tendinopathy acutely.'
  },

  wrist_sprain: {
    id:'wrist_sprain', name:'Wrist Sprain', icon:'🤚', severity:'mild',
    anatomy:'Tear of intercarpal or radiocarpal ligaments — most commonly dorsal radiocarpal ligament. Causes wrist pain with loading and movement.',
    mechanism:'Fall on outstretched hand (FOOSH), forced wrist extension, awkward grip under load.',
    acute_phase:{ duration_weeks:1, do:['PRICE protocol','Wrist brace or splint in neutral position','Avoid wrist loading','Maintain elbow and shoulder training (careful)'], avoid:['Any wrist loading','Push-ups and dips','Bench press and overhead press','Front rack position (barbell)'], exercises_ok:['Lower body training (all)','Elbow and shoulder exercises (no grip)','Core work (no hand bearing)'], exercises_avoid:['Push-ups','Dips','Bench press','Deadlift (grip pain)','Olympic lifts'] },
    subacute_phase:{ duration_weeks:3, do:['Progressive wrist ROM exercises','Gentle wrist flexion/extension with light band','Grip strengthening progression (putty, light dumbbell)','Modified lifting — wrist wraps or straps'], avoid:['Wrist hyperextension under load','Front rack position until fully pain-free'], exercises_ok:['Wrist circles','Light wrist curls and extensions','Grip exercises (progressive)','Barbell lifts with wrist wraps'], exercises_avoid:['Gymnastics-style weight on wrist (handstands)','Heavy clean and press'] },
    remodeling_phase:{ duration_weeks:4, do:['Full return to all wrist-loading exercises','Grip strength testing before return to heavy work','Proprioception exercises for wrist stabilisers'], avoid:['No permanent restrictions if fully healed'], exercises_ok:['Full training including overhead and pulling movements'], exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:2, typical:5, conservative:10 },
    red_flags:['Tenderness over scaphoid bone (anatomical snuffbox) — scaphoid fracture must be excluded (X-ray or MRI)','Significant ligament instability (DISI/VISI deformity)','TFCC pain (ulnar-sided wrist — needs MRI)'],
    evidence_source:'Rettig, Clinics in Sports Medicine — scaphoid fracture in FOOSH mechanism must be excluded with imaging before treating as sprain.'
  },

  shoulder_impingement: {
    id:'shoulder_impingement', name:'Shoulder Impingement', icon:'💪', severity:'mild',
    anatomy:'Mechanical compression of supraspinatus tendon and subacromial bursa under the acromion. Caused by weak rotator cuff, tight posterior capsule, and poor scapular control — NOT a traumatic injury.',
    mechanism:'Repetitive overhead movement, weak lower/middle trapezius and rotator cuff, tight posterior shoulder capsule, poor bench press or overhead press form.',
    acute_phase:{ duration_weeks:2, do:['Activity modification — avoid painful arc (60-120 degrees shoulder abduction)','Rotator cuff strengthening (external rotation with band)','Lower trapezius activation (Y-raises)','Ice post-exercise','Postural correction'], avoid:['Upright rows permanently — primary impingement cause','Behind-neck press permanently','Overhead pressing in painful range'], exercises_ok:['Band external rotation','Face pulls','Scapular retractions','Rear delt fly'], exercises_avoid:['Upright rows','Behind-neck press','Overhead press to failure','Heavy lateral raises (early)'] },
    subacute_phase:{ duration_weeks:6, do:['Rotator cuff strengthening — all 4 muscles targeted','Serratus anterior activation (serratus push-ups)','Lower and middle trapezius work','Progressive overhead pressing — watch for arc of pain'], avoid:['Upright rows and behind-neck movements (permanently)','Sleeping on affected shoulder'], exercises_ok:['Face pulls (3x/week permanently)','Band pull-aparts','Scapular Y/T/W exercises','Light overhead press (pain-free arc)'], exercises_avoid:['Upright rows (permanently)','Behind-neck press (permanently)'] },
    remodeling_phase:{ duration_weeks:4, do:['Full overhead pressing with technique correction','Maintain rotator cuff program permanently as injury prevention','Face pulls in every upper body session'], avoid:['Upright rows and behind-neck press — permanently contraindicated'], exercises_ok:['Full overhead pressing','All pulling movements','Full shoulder routine'], exercises_avoid:['Upright rows (permanent)','Behind-neck press (permanent)'] },
    return_to_gym_weeks:{ optimistic:4, typical:8, conservative:14 },
    red_flags:['Full thickness rotator cuff tear (persistent weakness despite rehabilitation)','Significant night pain (subacromial bursitis or full tear)','AC joint pain (separate condition)','No improvement after 6-8 weeks conservative management'],
    evidence_source:'Lewis BJSM 2016 — exercise therapy equally effective as surgery for shoulder impingement. Rotator cuff strengthening + scapular control is the evidence-based treatment.'
  },

  shin_splints: {
    id:'shin_splints', name:'Shin Splints (MTSS)', icon:'🦶', severity:'mild',
    anatomy:'Medial tibial stress syndrome — periosteal stress reaction along posteromedial tibia from tibialis posterior and soleus overload. Precursor to tibial stress fracture if ignored.',
    mechanism:'Rapid running volume increase, hard surfaces, worn footwear, overpronation. Common in beginners increasing mileage too fast.',
    acute_phase:{ duration_weeks:1, do:['Reduce running volume by 50-70%','Ice post-exercise (10-15 minutes)','Continue all non-impact training','Tibialis anterior strengthening (toe raises)','Review footwear'], avoid:['Running through sharp pain','Running on concrete in worn shoes','Sudden increase in training volume'], exercises_ok:['Swimming','Cycling','Upper body training','Tibialis raises','All non-impact lower body'], exercises_avoid:['Running (reduce significantly)','Box jumps','High impact plyometrics'] },
    subacute_phase:{ duration_weeks:4, do:['Graded return to running (10% rule — increase no more than 10% weekly)','Calf strengthening — eccentric emphasis','Hip strengthening (weakness contributes to MTSS)','Gait analysis if recurring'], avoid:['Rapid volume increase','Running through pain above 4/10'], exercises_ok:['Jogging (graded return)','Cycling','All gym work','Calf raises'], exercises_avoid:['Sprint running (weeks 1-3)','High impact (weeks 1-2)'] },
    remodeling_phase:{ duration_weeks:4, do:['Full return to running with modified progression','Maintain tibialis and calf strengthening permanently','Address any biomechanical factors'], avoid:['Neglecting strength work — MTSS has 30-60% recurrence rate without addressing cause'], exercises_ok:['Full running programme','All training'], exercises_avoid:[] },
    return_to_gym_weeks:{ optimistic:2, typical:5, conservative:10 },
    red_flags:['Focal point tenderness on tibia (tibial stress fracture — needs imaging)','Night pain in tibia (stress fracture)','Severe pain with minimal activity','Swelling and warmth on tibia'],
    evidence_source:'Winters et al BJSM 2018 — graded running return effective. Tibial stress fracture must be excluded with MRI if pain localised or nocturnal. 10% volume increase rule.'
  }
};

/* ── REHAB SCREEN ── */
reg('rehab', function() {
  var injuries = S.g('user.injuries') || [];
  var activeInjuries = [];
  injuries.forEach(function(i, idx) {
    if (i && typeof i === 'object' && !i.recovered) activeInjuries.push({ inj: i, idx: idx });
  });

  var activeSection = '';
  if (activeInjuries.length) {
    activeSection = sh('Active Injuries') +
      '<div style="padding:0 16px">' +
      activeInjuries.map(function(item) {
        var inj = item.inj;
        var protocol = INJURY_DB[inj.id];
        if (!protocol) {
          var k = Object.keys(INJURY_DB).find(function(key) {
            return INJURY_DB[key].name.toLowerCase().includes((inj.bodyPart||'').toLowerCase());
          });
          protocol = k ? INJURY_DB[k] : null;
        }
        var daysSince = inj.date ? Math.floor((Date.now() - new Date(inj.date)) / 86400000) : 0;
        var weeksSince = Math.floor(daysSince / 7);
        var phase = 'acute', phaseColor = '#ff453a', phaseLabel = 'Acute Phase';
        if (protocol) {
          if (weeksSince >= protocol.acute_phase.duration_weeks + protocol.subacute_phase.duration_weeks) {
            phase = 'remodeling'; phaseColor = '#30d158'; phaseLabel = 'Remodeling Phase';
          } else if (weeksSince >= protocol.acute_phase.duration_weeks) {
            phase = 'subacute'; phaseColor = '#ff9f0a'; phaseLabel = 'Sub-acute Phase';
          }
        }
        var injId = inj.id || (protocol ? protocol.id : '');
        var phaseData = protocol ? protocol[phase + '_phase'] : null;
        return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:10px">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
          '<div style="font-size:15px;font-weight:700;color:var(--txt)">' + esc(inj.bodyPart || 'Injury') + '</div>' +
          '<div style="padding:3px 10px;border-radius:10px;background:' + phaseColor + '22;border:1px solid ' + phaseColor + '44;font-size:11px;font-weight:700;color:' + phaseColor + '">' + phaseLabel + '</div>' +
          '</div>' +
          '<div style="font-size:12px;color:var(--txt3);margin-bottom:10px">Day ' + daysSince + ' of recovery · Week ' + weeksSince + '</div>' +
          '<div style="display:flex;gap:6px;margin-bottom:10px">' +
          [1,2,3].map(function(s) {
            var sev = inj.severity || 1;
            var lbl = typeof InjuriesDB !== 'undefined' ? (InjuriesDB.severities.find(function(x){return x.id===s;})||{}).label : s;
            return '<button type="button" onclick="setInjurySeverity(' + item.idx + ',' + s + ')" style="flex:1;padding:6px;border-radius:8px;font-size:11px;font-weight:600;border:1px solid ' + (sev===s?'var(--c1)':'var(--border)') + ';background:' + (sev===s?'rgba(var(--c1-rgb),0.15)':'transparent') + ';color:var(--txt);cursor:pointer;touch-action:manipulation">' + lbl + '</button>';
          }).join('') + '</div>' +
          (phaseData ? '<div style="font-size:12px;color:var(--txt2);line-height:1.6;margin-bottom:6px">' + phaseData.do.slice(0, 2).map(function(d) { return '✅ ' + d; }).join('<br>') + '</div>' +
            '<div style="font-size:12px;color:#ff453a;line-height:1.6;margin-bottom:10px">' + phaseData.avoid.slice(0, 2).map(function(d) { return '❌ ' + d; }).join('<br>') + '</div>' : '') +
          '<div style="display:flex;gap:8px">' +
          '<button type="button" onclick="showInjuryProtocol(\'' + injId + '\')" style="flex:1;padding:10px;border-radius:12px;background:var(--bg4);border:1px solid var(--border);color:var(--txt);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">📋 Full Protocol</button>' +
          '<button type="button" onclick="markInjuryRecovered(\'' + esc(inj.bodyPart || '') + '\')" style="padding:10px 14px;border-radius:12px;background:rgba(48,209,88,0.1);border:1px solid rgba(48,209,88,0.3);color:#30d158;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation">✅ Recovered</button>' +
          '</div></div>';
      }).join('') + '</div>';
  } else {
    activeSection = '<div style="margin:0 16px 14px;padding:16px;background:var(--bg3);border:1px solid var(--border);border-radius:16px;text-align:center">' +
      '<div style="font-size:32px;margin-bottom:8px">🟢</div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt)">No active injuries</div>' +
      '<div style="font-size:12px;color:var(--txt3);margin-top:4px">Your body is ready to train</div></div>';
  }

  return '<div class="topbar"><div class="topbar-title">Rehab & Recovery</div></div>' +
    activeSection +
    sh('Log New Injury', '+ Log', 'showLogInjuryModal()') +
    sh('Injury Library') +
    '<div style="padding:0 16px">' +
    Object.values(INJURY_DB).map(function(inj) {
      return '<div onclick="showInjuryProtocol(\'' + inj.id + '\')" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);cursor:pointer;touch-action:manipulation">' +
        '<div style="font-size:24px;flex-shrink:0">' + inj.icon + '</div>' +
        '<div style="flex:1">' +
        '<div style="font-size:14px;font-weight:600;color:var(--txt)">' + inj.name + '</div>' +
        '<div style="font-size:12px;color:var(--txt3)">Return: ' + inj.return_to_gym_weeks.typical + ' weeks typical</div>' +
        '</div>' +
        '<div style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;background:' + (inj.severity === 'mild' ? 'rgba(48,209,88,.1)' : inj.severity === 'moderate' ? 'rgba(255,159,10,.1)' : 'rgba(255,69,58,.1)') + ';color:' + (inj.severity === 'mild' ? '#30d158' : inj.severity === 'moderate' ? '#ff9f0a' : '#ff453a') + '">' + inj.severity + '</div>' +
        '<div style="color:var(--txt3);font-size:16px;margin-left:4px">›</div>' +
        '</div>';
    }).join('') +
    '</div><div style="height:20px"></div>';
});

window.showInjuryProtocol = function(id) {
  var inj = INJURY_DB[id];
  if (!inj) return;
  modal(inj.icon + ' ' + inj.name,
    '<div style="font-size:12px;color:var(--txt2);line-height:1.6;margin-bottom:14px">' + inj.anatomy + '</div>' +
    '<div style="background:rgba(255,69,58,0.08);border:1px solid rgba(255,69,58,0.2);border-radius:12px;padding:12px;margin-bottom:8px">' +
    '<div style="font-size:11px;font-weight:700;color:#ff453a;margin-bottom:6px">PHASE 1 — ACUTE (0-' + inj.acute_phase.duration_weeks + ' weeks)</div>' +
    inj.acute_phase.do.map(function(d) { return '<div style="font-size:12px;color:var(--txt2);margin-bottom:2px">✅ ' + d + '</div>'; }).join('') +
    inj.acute_phase.avoid.map(function(d) { return '<div style="font-size:12px;color:#ff453a;margin-bottom:2px">❌ ' + d + '</div>'; }).join('') +
    '</div>' +
    '<div style="background:rgba(255,159,10,0.08);border:1px solid rgba(255,159,10,0.2);border-radius:12px;padding:12px;margin-bottom:8px">' +
    '<div style="font-size:11px;font-weight:700;color:#ff9f0a;margin-bottom:6px">PHASE 2 — SUB-ACUTE (weeks ' + inj.acute_phase.duration_weeks + '-' + (inj.acute_phase.duration_weeks + inj.subacute_phase.duration_weeks) + ')</div>' +
    inj.subacute_phase.do.map(function(d) { return '<div style="font-size:12px;color:var(--txt2);margin-bottom:2px">✅ ' + d + '</div>'; }).join('') +
    inj.subacute_phase.avoid.map(function(d) { return '<div style="font-size:12px;color:#ff453a;margin-bottom:2px">❌ ' + d + '</div>'; }).join('') +
    '</div>' +
    '<div style="background:rgba(48,209,88,0.08);border:1px solid rgba(48,209,88,0.2);border-radius:12px;padding:12px;margin-bottom:8px">' +
    '<div style="font-size:11px;font-weight:700;color:#30d158;margin-bottom:6px">PHASE 3 — REMODELING (weeks ' + (inj.acute_phase.duration_weeks + inj.subacute_phase.duration_weeks) + '+)</div>' +
    inj.remodeling_phase.do.map(function(d) { return '<div style="font-size:12px;color:var(--txt2);margin-bottom:2px">✅ ' + d + '</div>'; }).join('') +
    inj.remodeling_phase.avoid.map(function(d) { return '<div style="font-size:12px;color:#ff453a;margin-bottom:2px">❌ ' + d + '</div>'; }).join('') +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">' +
    '<div style="background:var(--bg4);border-radius:10px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:800;color:#30d158">' + inj.return_to_gym_weeks.optimistic + 'w</div><div style="font-size:9px;color:var(--txt3)">Best case</div></div>' +
    '<div style="background:var(--bg4);border-radius:10px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:800;color:var(--c1)">' + inj.return_to_gym_weeks.typical + 'w</div><div style="font-size:9px;color:var(--txt3)">Typical</div></div>' +
    '<div style="background:var(--bg4);border-radius:10px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:800;color:#ff9f0a">' + inj.return_to_gym_weeks.conservative + 'w</div><div style="font-size:9px;color:var(--txt3)">Conservative</div></div>' +
    '</div>' +
    '<div style="background:rgba(255,69,58,0.08);border:1px solid rgba(255,69,58,0.2);border-radius:10px;padding:10px;margin-bottom:10px">' +
    '<div style="font-size:10px;font-weight:700;color:#ff453a;margin-bottom:5px">🚨 SEE A DOCTOR IF:</div>' +
    inj.red_flags.map(function(f) { return '<div style="font-size:11px;color:var(--txt2);margin-bottom:2px">• ' + f + '</div>'; }).join('') +
    '</div>' +
    '<div style="font-size:10px;color:var(--txt3);font-style:italic">' + inj.evidence_source + '</div>',
    '<div style="display:flex;gap:8px">' +
    '<button type="button" class="btn btn-primary" style="flex:1" onclick="logThisInjury(\'' + id + '\')">Log This Injury</button>' +
    '<button type="button" class="btn btn-ghost" onclick="closeModal()">Close</button>' +
    '</div>'
  );
};

/* INJURY_DB condition → joint, so InjuriesDB (severity / exercise filtering)
   understands rehab-logged injuries too. */
var REHAB_JOINT = {
  shoulder_dislocation:'shoulder', rotator_cuff_tear:'shoulder', shoulder_impingement:'shoulder',
  ankle_sprain_mild:'ankle', ankle_sprain_severe:'ankle', achilles_tendinopathy:'ankle', shin_splints:'ankle',
  herniated_disc:'spine', lower_back_strain:'spine',
  patellar_tendinitis:'knee', acl_tear:'knee', meniscus_tear:'knee', quad_strain:'knee',
  tennis_elbow:'elbow', golfers_elbow:'elbow', bicep_tendon_tear:'elbow',
  hamstring_strain:'hip', hip_flexor_strain:'hip', groin_strain:'hip',
  wrist_sprain:'wrist'
};

window.logThisInjury = function(injuryId) {
  var inj = INJURY_DB[injuryId];
  if (!inj) return;
  var injuries = S.g('user.injuries') || [];
  if (injuries.find(function(i) { return i.id === injuryId && !i.recovered; })) {
    toast('Already logged', 'warn'); return;
  }
  /* Severity drives rest advice + exercise filtering — ask before saving */
  var sevBtns = (typeof InjuriesDB !== 'undefined' ? InjuriesDB.severities : [
    {id:1,label:'Mild',desc:''},{id:2,label:'Moderate',desc:''},{id:3,label:'Severe',desc:''}
  ]).map(function(s) {
    return '<button type="button" onclick="_confirmLogInjury(\'' + injuryId + '\',' + s.id + ')" ' +
      'style="width:100%;text-align:left;padding:12px 14px;border-radius:12px;margin-bottom:8px;border:1px solid var(--border);background:var(--bg3);cursor:pointer;touch-action:manipulation">' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt)">' + s.label + '</div>' +
      '<div style="font-size:11px;color:var(--txt3);margin-top:2px">' + esc(s.desc || '') + '</div></button>';
  }).join('');
  modal(inj.icon + ' How bad is it?', sevBtns,
    '<button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>');
};

window._confirmLogInjury = function(injuryId, severity) {
  var inj = INJURY_DB[injuryId];
  if (!inj) return;
  var injuries = S.g('user.injuries') || [];
  injuries.push({
    id: injuryId, bodyPart: inj.name, joint: REHAB_JOINT[injuryId] || null,
    severity: severity || 2, date: new Date().toISOString(), addedAt: today(), recovered: false
  });
  S.set('user.injuries', injuries);
  closeModal();
  toast('Injury logged — rehab protocol active, workouts will adapt', 'ok');
  go('rehab');
};

window.showLogInjuryModal = function() {
  modal('🩹 Log Injury',
    '<div style="font-size:13px;color:var(--txt2);margin-bottom:12px">Select your injury to get a personalised rehab protocol:</div>' +
    '<div style="max-height:60vh;overflow-y:auto">' +
    Object.values(INJURY_DB).map(function(inj) {
      return '<div onclick="logThisInjury(\'' + inj.id + '\')" style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;background:var(--bg3);border:1px solid var(--border);margin-bottom:8px;cursor:pointer;touch-action:manipulation">' +
        '<div style="font-size:22px">' + inj.icon + '</div>' +
        '<div><div style="font-size:14px;font-weight:600;color:var(--txt)">' + inj.name + '</div>' +
        '<div style="font-size:11px;color:var(--txt3)">Typical return: ' + inj.return_to_gym_weeks.typical + ' weeks</div></div>' +
        '</div>';
    }).join('') + '</div>',
    '<button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>'
  );
};

window.markInjuryRecovered = function(bodyPart) {
  var injuries = S.g('user.injuries') || [];
  var inj = injuries.find(function(i) { return i.bodyPart === bodyPart && !i.recovered; });
  if (inj) { inj.recovered = true; S.set('user.injuries', injuries); }
  toast('Marked as recovered!', 'ok');
  go('rehab');
};
