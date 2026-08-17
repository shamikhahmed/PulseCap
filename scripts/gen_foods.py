#!/usr/bin/env python3
"""Emit js/data/foods-db.js — lite guidance, sourced macros, labelled portions."""
from pathlib import Path

USDA = "USDA FoodData Central"
PK = "Typical Karachi cooked-portion estimate from USDA components (oil/rice/meat vary by kitchen)"

# id|name|cal|p|c|f|g|portion|source
RAW = r"""
egg|Egg (large)|72|6.3|0.4|4.8|50|1 large (50 g)|USDA FoodData Central 748967
egg_white|Egg white|17|3.6|0.2|0.1|33|1 large white|USDA FoodData Central 173410
chicken_breast|Chicken breast (cooked)|165|31|0|3.6|100|100 g cooked|USDA FoodData Central 171477
chicken_thigh|Chicken thigh (cooked)|209|26|0|10.9|100|100 g cooked|USDA FoodData Central 172386
turkey|Turkey breast (cooked)|135|30|0|0.7|100|100 g cooked|USDA FoodData Central 171506
salmon|Salmon (Atlantic, cooked)|206|22.1|0|12.4|100|100 g cooked|USDA FoodData Central 175167
tuna|Tuna (canned in water)|86|19.4|0|0.6|100|100 g drained|USDA FoodData Central 175160
tuna_fresh|Tuna (fresh, cooked)|184|30|0|6|100|100 g cooked|USDA FoodData Central 175159
beef_lean|Lean beef (cooked)|250|26|0|15|100|100 g cooked|USDA FoodData Central 174032
cod|Cod (cooked)|105|23|0|0.9|100|100 g cooked|USDA FoodData Central 171239
shrimp|Shrimp (cooked)|99|24|0.2|0.3|100|100 g cooked|USDA FoodData Central 175180
lamb|Lamb (cooked, lean)|258|25|0|17|100|100 g cooked|USDA FoodData Central 174370
sardines|Sardines (canned)|208|25|0|11|100|100 g|USDA FoodData Central 175139
pork_loin|Pork loin (cooked)|242|27|0|14|100|100 g cooked|USDA FoodData Central 167862
greek_yogurt|Greek yogurt (plain, 2%)|73|10|3.9|1.9|100|100 g|USDA FoodData Central 170903
cottage|Cottage cheese (low-fat)|72|10.3|3.1|1|100|100 g|USDA FoodData Central 172385
yogurt_dahi|Dahi (plain yogurt)|61|3.5|4.7|3.3|100|100 g|USDA FoodData Central 171236
skyr|Skyr / Icelandic yogurt|63|11|4|0.2|100|100 g|USDA FoodData Central 170904 similar
whey|Whey protein scoop|120|24|3|1.5|30|30 g scoop|Product label typical whey — verify your tub
casein|Casein scoop|120|24|4|1|32|1 scoop|Product label typical — verify your tub
milk|Milk (whole) 250ml|149|7.7|12|8|250|250 ml|USDA FoodData Central 171265
skim_milk|Milk (skim) 250ml|86|8.4|12.5|0.2|250|250 ml|USDA FoodData Central 171269
almond_milk|Almond milk (unsweetened) 250ml|38|1.3|1.5|2.8|250|250 ml|USDA FoodData Central 174832
soy_milk|Soy milk (unsweetened) 250ml|80|7|4|4|250|250 ml|USDA FoodData Central typical unsweetened
oat_milk|Oat milk 250ml|120|3|16|5|250|250 ml|Product label typical oat drink
oats|Oats (dry)|389|16.9|66.3|6.9|100|100 g dry|USDA FoodData Central 173904
rice|White rice (cooked)|130|2.7|28.2|0.3|100|100 g cooked|USDA FoodData Central 168878
brown_rice|Brown rice (cooked)|123|2.7|25.6|1|100|100 g cooked|USDA FoodData Central 169704
basmati|Basmati rice (cooked)|121|3.5|25|0.4|100|100 g cooked|USDA white rice similar 168878
sela_rice|Sela rice (cooked)|125|2.6|28|0.3|100|100 g cooked|USDA parboiled rice similar
potato|Potato (baked, flesh)|93|2.5|21.6|0.1|100|100 g|USDA FoodData Central 170108
sweet_potato|Sweet potato (baked)|90|2|20.7|0.2|100|100 g|USDA FoodData Central 168482
banana|Banana (medium)|105|1.3|27|0.4|118|1 medium (118 g)|USDA FoodData Central 173944
apple|Apple (medium)|95|0.5|25.1|0.3|182|1 medium (182 g)|USDA FoodData Central 171688
berries|Mixed berries|57|0.7|14.5|0.3|100|100 g|USDA FoodData Central 171711
broccoli|Broccoli (cooked)|35|2.4|7.2|0.4|100|100 g|USDA FoodData Central 169967
spinach|Spinach (raw)|23|2.9|3.6|0.4|100|100 g|USDA FoodData Central 168462
avocado|Avocado|160|2|8.5|14.7|100|100 g (~½ fruit)|USDA FoodData Central 171705
almonds|Almonds|579|21.2|21.6|49.9|100|100 g|USDA FoodData Central 170567
peanut_butter|Peanut butter (tbsp)|94|4|3.1|8|16|1 tbsp (16 g)|USDA FoodData Central 172470
olive_oil|Olive oil (tbsp)|119|0|0|13.5|14|1 tbsp (14 g)|USDA FoodData Central 171413
bread|Whole wheat bread (slice)|81|4|13.7|1.1|28|1 slice (28 g)|USDA FoodData Central 172688
pasta|Pasta (cooked)|131|5|25.4|1.1|100|100 g cooked|USDA FoodData Central 168917
tofu|Tofu (firm)|144|17.3|2.8|8.7|100|100 g|USDA FoodData Central 172475
lentils|Lentils (cooked)|116|9|20.1|0.4|100|100 g cooked|USDA FoodData Central 172421
beans|Black beans (cooked)|132|8.9|23.7|0.5|100|100 g cooked|USDA FoodData Central 175167
cheese|Cheddar cheese|403|22.9|1.3|33.1|100|100 g|USDA FoodData Central 173414
rice_cake|Rice cake|35|0.7|7.3|0.3|9|1 cake (9 g)|USDA FoodData Central 174077
honey|Honey (tbsp)|64|0.1|17.3|0|21|1 tbsp (21 g)|USDA FoodData Central 169640
creatine_food|Creatine monohydrate (5g)|0|0|0|0|5|5 g|Pure creatine — no macros
roti|Roti / chapati|120|3.5|22|2.2|40|1 roti (~40 g)|Typical atta roti; wheat similar to USDA 170688
naan|Naan|262|7.6|45|5.1|90|1 naan (~90 g)|USDA FoodData Central 170286 similar leavened wheat bread
paratha|Paratha (plain)|260|5|32|12|80|1 paratha (~80 g)|Typical Karachi cooked-portion estimate from USDA atta + ghee
tandoori_roti|Tandoori roti|130|4|24|1.5|45|1 roti|Typical tandoor wheat roti
rumali_roti|Rumali roti|110|3|22|1|35|1 rumali|Typical thin wheat roti
whole_wheat_roti_large|Large wheat roti|160|5|30|2.5|55|1 large (~55 g)|Typical atta roti, larger
daal_chana|Chana daal (cooked)|164|8.9|27|2.6|140|1 katori / ~140 g cooked|USDA 173722 chickpeas cooked; tadka extra
daal_masoor|Masoor daal (cooked)|116|9|20|0.4|140|1 katori / ~140 g cooked|USDA FoodData Central 172421 lentils
daal_moong|Moong daal (cooked)|105|7|19|0.4|140|1 katori / ~140 g cooked|USDA FoodData Central 174253 mung beans cooked
daal_makhani|Daal makhani|200|9|22|8|180|1 katori|USDA lentils + cream/butter estimate
chicken_karahi|Chicken karahi|220|18|6|14|180|1 plate (~180 g with gravy)|Typical Karachi cooked-portion estimate from USDA chicken + oil
beef_karahi|Beef karahi|280|20|5|20|180|1 plate (~180 g with gravy)|Typical Karachi cooked-portion estimate from USDA beef + oil
mutton_karahi|Mutton karahi|300|19|5|22|180|1 plate (~180 g)|Typical Karachi cooked-portion estimate from USDA lamb + oil
nihari|Nihari|310|18|8|22|250|1 bowl (~250 g)|Typical Karachi stew estimate (marrow/oil varies)
nihari_lean|Nihari (skimmed oil)|240|20|8|14|250|1 bowl, home-style skimmed|Typical home nihari with skimmed oil
biryani_chicken|Chicken biryani|280|12|38|9|250|1 plate (~250 g)|Typical Karachi cooked-portion estimate from USDA rice + chicken + oil
biryani_beef|Beef biryani|300|13|36|12|250|1 plate (~250 g)|Typical Karachi cooked-portion estimate from USDA rice + beef + oil
pulao|Chicken pulao|240|10|34|7|220|1 plate (~220 g)|Typical Karachi cooked-portion estimate from USDA rice + chicken
haleem|Haleem|200|12|22|7|250|1 bowl (~250 g)|Typical wheat + meat porridge estimate
qeema|Qeema (mince curry)|240|18|6|16|150|1 katori (~150 g)|Typical Karachi cooked-portion estimate from USDA mince + oil
seekh_kebab|Seekh kebab|220|16|3|16|80|2 kebabs (~80 g)|Typical mixed-mince kebab estimate
chicken_tikka|Chicken tikka|180|24|3|8|120|4 pieces (~120 g)|Typical tandoor yogurt-marinade estimate
raita|Raita|70|3.5|6|3.5|100|1 katori (~100 g)|USDA yogurt + cucumber estimate
lassi_sweet|Lassi (sweet)|180|6|28|5|250|1 glass (250 ml)|Typical yogurt drink; sugar varies
lassi_salted|Lassi (salted)|110|6|8|5|250|1 glass (250 ml)|Typical salted yogurt drink
lassi_mango|Mango lassi|220|6|36|6|300|1 glass|Typical mango + yogurt drink
chana_chaat|Chana chaat|190|8|28|5|180|1 plate (~180 g)|USDA chickpeas + chutney estimate
samosa|Samosa (potato)|250|4|24|16|70|1 piece (~70 g)|Typical deep-fried pastry; oil uptake varies
halwa_puri|Halwa puri plate|620|10|78|28|300|1 plate (2 puri + chana + halwa)|Typical festive breakfast estimate
aloo_paratha|Aloo paratha|320|6|40|14|120|1 stuffed paratha|Typical stuffed paratha estimate
anda_paratha|Anda paratha|380|12|34|20|140|1 egg paratha|Typical egg + paratha estimate
office_biryani|Office chicken biryani box|450|18|58|14|350|1 takeaway box (~350 g)|Typical Karachi office box estimate
nihari_naan|Nihari + 1 naan|570|25|53|27|340|1 bowl + 1 naan|Combined plate estimate
chicken_roll|Chicken roll (paratha wrap)|420|18|38|20|180|1 roll|Typical street-style wrap estimate
beef_roll|Beef roll (paratha wrap)|460|20|36|24|180|1 roll|Typical street-style wrap estimate
dahi_bhalla|Dahi bhalla|220|7|28|8|150|1 plate|Typical yogurt + lentil dumpling estimate
gol_gappa|Gol gappa / pani puri (6)|180|4|28|6|120|6 pieces with filling|Typical street snack estimate
pakora|Pakora mix|280|6|22|18|100|100 g fried|Typical gram-flour fry estimate
chicken_sajji|Chicken sajji (portion)|260|28|2|16|150|150 g meat|Typical roasted chicken estimate
daal_chawal|Daal chawal|320|12|52|6|350|1 plate rice + daal|USDA rice + lentils combo
omelette_desi|Desi omelette (2 eggs)|220|13|2|18|120|2 eggs + oil/onion|USDA eggs + 1 tsp oil
chai_doodh|Doodh patti chai|90|3|12|3|150|1 cup with sugar|Typical milk tea, 1 tsp sugar
karak_chai|Karak chai|80|2|12|2.5|150|1 cup|Typical cafe karak estimate
kheer|Kheer|180|5|28|5|150|1 katori|Typical rice pudding estimate
gulab_jamun|Gulab jamun (2)|280|4|42|12|80|2 pieces|Typical syrup dessert estimate
jalebi|Jalebi (3 pieces)|240|2|42|8|60|3 pieces|Typical syrup dessert estimate
keema_naan|Keema naan|380|14|48|14|140|1 stuffed naan|Typical stuffed naan estimate
butter_chicken|Butter chicken|290|16|10|20|200|1 katori|Typical cream/butter gravy estimate
palak_paneer|Palak paneer|220|10|8|16|180|1 katori|USDA spinach + paneer estimate
paneer|Paneer|265|18|3.4|20|100|100 g|USDA FoodData Central 170459 similar fresh cheese
mango|Mango (sliced)|60|0.8|15|0.4|100|100 g|USDA FoodData Central 169910
dates|Dates (3)|66|0.6|18|0.1|24|3 dates (~24 g)|USDA FoodData Central 168191
chana_masala|Chana masala|180|8|24|6|180|1 katori|USDA chickpeas + oil tadka
aloo_gobi|Aloo gobi|140|3|18|6|180|1 katori|Typical potato + cauliflower sabzi
bhindi|Bhindi masala|120|2|10|8|150|1 katori|Typical okra + oil
chicken_handi|Chicken handi|240|18|8|14|180|1 plate|Typical Karachi cooked-portion estimate
chapli_kebab|Chapli kebab|280|16|8|20|100|1 kebab|Typical Peshawari fried kebab estimate
shami_kebab|Shami kebab (2)|200|12|10|12|80|2 kebabs|Typical lentil-mince kebab estimate
nimbu_pani|Nimbu pani (sweet)|70|0|18|0|250|1 glass|Sugar water + lemon estimate
chicken_corn_soup|Chicken corn soup|90|6|12|2|250|1 bowl|Typical restaurant soup estimate
fried_rice_desi|Egg fried rice|220|6|32|8|200|1 plate|Typical cafe fried-rice estimate
chowmein|Chicken chowmein|280|12|36|10|250|1 plate|Typical cafe estimate
club_sandwich|Club sandwich|450|22|38|22|180|1 sandwich|Cafe estimate — mayo varies
zinger_style|Crispy chicken burger|520|24|42|26|200|1 burger|Fast-food estimate
fries_small|Fries (small)|320|4|42|16|110|small portion|USDA FoodData Central 170698
bun_kebab|Bun kebab|380|14|36|18|160|1 bun kebab|Typical Karachi street food estimate
anday_wala_burger|Anday wala burger|420|16|34|22|170|1 burger|Typical Karachi street food estimate
kofta|Kofta curry (3)|280|16|10|20|180|3 koftas with gravy|Typical mince-ball curry estimate
seekh_roll|Seekh kebab roll|400|18|32|20|170|1 roll|Typical kebab + paratha estimate
malai_boti|Malai boti|210|22|3|12|120|4 pieces|Typical cream-marinade tikka estimate
reshmi_kebab|Reshmi kebab|200|20|3|12|100|2 kebabs|Typical minced kebab estimate
jeera_rice|Jeera rice|180|3.5|34|4|180|1 plate|USDA rice + oil/cumin
onion_raita|Onion raita|60|3|6|2.5|100|1 katori|USDA yogurt estimate
kachumber|Kachumber salad|35|1|7|0.2|120|1 plate|USDA cucumber/tomato/onion
papad|Papad (roasted)|40|2|6|0.5|10|1 roasted|USDA papadum similar
chaas|Chaas / salted buttermilk|50|3|5|1.5|200|1 glass|USDA buttermilk similar
quinoa|Quinoa (cooked)|120|4.4|21.3|1.9|100|100 g cooked|USDA FoodData Central 168917
couscous|Couscous (cooked)|112|3.8|23|0.2|100|100 g|USDA FoodData Central 169700
orange|Orange (medium)|62|1.2|15.4|0.2|131|1 medium|USDA FoodData Central 169917
grapes|Grapes|69|0.7|18.1|0.2|100|100 g|USDA FoodData Central 174683
watermelon|Watermelon|30|0.6|7.6|0.2|100|100 g|USDA FoodData Central 167765
pear|Pear (medium)|101|0.6|27|0.2|178|1 medium|USDA FoodData Central 169118
peach|Peach|39|0.9|9.5|0.3|100|100 g|USDA FoodData Central 169928
pineapple|Pineapple|50|0.5|13.1|0.1|100|100 g|USDA FoodData Central 169124
strawberries|Strawberries|32|0.7|7.7|0.3|100|100 g|USDA FoodData Central 167762
blueberries|Blueberries|57|0.7|14.5|0.3|100|100 g|USDA FoodData Central 171711
carrot|Carrot (raw)|41|0.9|9.6|0.2|100|100 g|USDA FoodData Central 170393
cucumber|Cucumber|15|0.7|3.6|0.1|100|100 g|USDA FoodData Central 169910
tomato|Tomato|18|0.9|3.9|0.2|100|100 g|USDA FoodData Central 170457
onion|Onion|40|1.1|9.3|0.1|100|100 g|USDA FoodData Central 170000
cauliflower|Cauliflower (cooked)|23|1.8|4.1|0.5|100|100 g|USDA FoodData Central 169986
cabbage|Cabbage|25|1.3|5.8|0.1|100|100 g|USDA FoodData Central 169975
peas|Peas (cooked)|84|5.4|15.6|0.2|100|100 g|USDA FoodData Central 170419
corn|Sweet corn (cooked)|96|3.4|21|1.5|100|100 g|USDA FoodData Central 170288
mushroom|Mushrooms (cooked)|28|2.2|5.3|0.5|100|100 g|USDA FoodData Central 169251
walnut|Walnuts|654|15.2|13.7|65.2|100|100 g|USDA FoodData Central 170187
cashew|Cashews|553|18.2|30.2|43.9|100|100 g|USDA FoodData Central 170162
pistachio|Pistachios|560|20.2|27.2|45.3|100|100 g|USDA FoodData Central 170184
peanuts|Peanuts|567|25.8|16.1|49.2|100|100 g|USDA FoodData Central 174609
chia|Chia seeds (tbsp)|58|2|5|3.7|12|1 tbsp|USDA FoodData Central 170554
butter|Butter (tsp)|34|0|0|3.8|5|1 tsp|USDA FoodData Central 173410
ghee|Ghee (tsp)|45|0|0|5|5|1 tsp|USDA FoodData Central 171410 similar
hummus|Hummus|166|7.9|14.3|9.6|100|100 g|USDA FoodData Central 174289
dark_chocolate|Dark chocolate 70%|598|7.8|45.9|42.6|100|100 g|USDA FoodData Central 170273
espresso|Espresso|3|0.1|0|0|30|1 shot|USDA FoodData Central 171891
green_tea|Green tea|2|0|0|0|240|1 cup|USDA FoodData Central 174852
edamame|Edamame|121|11.9|8.9|5.2|100|100 g|USDA FoodData Central 168411
tempeh|Tempeh|193|20.3|7.6|10.8|100|100 g|USDA FoodData Central 174272
turkey_mince|Turkey mince (cooked)|189|27|0|8|100|100 g|USDA FoodData Central 171506
beef_mince_lean|Lean beef mince (cooked)|212|26|0|11|100|100 g|USDA FoodData Central 174032
chicken_mince|Chicken mince (cooked)|189|27|0|8|100|100 g|USDA chicken mix estimate
coconut_water|Coconut water|19|0.7|3.7|0.2|100|100 ml|USDA FoodData Central 170174
kiwi|Kiwi|61|1.1|14.7|0.5|100|100 g|USDA FoodData Central 168153
lettuce|Lettuce|15|1.4|2.9|0.2|100|100 g|USDA FoodData Central 169247
green_beans|Green beans (cooked)|35|1.9|7.9|0.3|100|100 g|USDA FoodData Central 169961
zucchini|Zucchini|17|1.2|3.1|0.3|100|100 g|USDA FoodData Central 169291
olive|Olives (5)|40|0.3|1|4|20|5 olives|USDA FoodData Central 169094
flax|Flaxseed (tbsp)|55|1.9|3|4.3|10|1 tbsp|USDA FoodData Central 169414
pumpkin_seed|Pumpkin seeds|559|30.2|10.7|49|100|100 g|USDA FoodData Central 170556
sunflower|Sunflower seeds|584|20.8|20|51.5|100|100 g|USDA FoodData Central 170562
coconut_oil|Coconut oil (tbsp)|121|0|0|13.5|14|1 tbsp|USDA FoodData Central 171412
mayo|Mayonnaise (tbsp)|94|0.1|0.1|10.3|14|1 tbsp|USDA FoodData Central 171401
bagel|Bagel (plain)|250|10|49|1.5|98|1 bagel|USDA FoodData Central 167531
corn_tortilla|Corn tortilla|52|1.4|10.7|0.7|24|1 tortilla|USDA FoodData Central 175027
bulgur|Bulgur (cooked)|83|3.1|18.6|0.2|100|100 g|USDA FoodData Central 169672
barley|Barley (cooked)|123|2.3|28.2|0.4|100|100 g|USDA FoodData Central 170284
capsicum|Bell pepper|31|1|6|0.3|100|100 g|USDA FoodData Central 170108
beetroot|Beetroot (cooked)|44|1.7|10|0.2|100|100 g|USDA FoodData Central 169145
protein_bar|Protein bar (typical)|200|20|22|6|60|1 bar|Product label typical — check yours
overnight_oats|Overnight oats cup|320|14|48|8|250|1 jar oats + milk + banana|USDA oats/milk/banana combo
grilled_chicken_rice|Grilled chicken + rice|380|32|42|8|300|120 g chicken + 150 g rice|USDA combo
tuna_sandwich|Tuna sandwich|340|24|32|12|160|1 sandwich|USDA tuna + bread combo
rice_daal_sabzi|Rice + daal + sabzi|420|16|62|10|450|1 thali plate|USDA rice + lentils + vegetable combo
egg_bhurji|Anda bhurji|240|14|4|18|150|2-egg scramble with oil|USDA eggs + oil
chicken_salad|Chicken salad bowl|280|32|12|12|250|1 bowl|USDA chicken + veg combo
banana_shake|Banana protein shake|250|26|32|3|400|banana + whey + water|USDA banana + typical whey
raita_mint|Mint raita|65|3.5|6|3|100|1 katori|USDA yogurt estimate
green_chutney|Green chutney (tbsp)|15|0.4|2|0.5|15|1 tbsp|Herbs + yogurt estimate
achar|Achar (tsp)|20|0.2|1|1.8|8|1 tsp|Oil pickle estimate
paya|Paya|260|18|4|18|250|1 bowl|Typical trotter stew estimate
siri_paye|Siri paye (bowl)|340|22|4|26|280|1 bowl|Typical high-collagen stew estimate
chicken_malai_handi|Chicken malai handi|270|16|8|18|180|1 katori|Typical cream-handi estimate
fish_fry_desi|Masala fried fish|260|20|8|16|120|1 fillet fried|Typical fried-fish estimate
raita_boondi|Boondi raita|110|4|12|5|120|1 katori|Typical yogurt + boondi estimate
rooh_afza_milk|Rooh Afza milk|160|5|28|4|250|1 glass|Milk + syrup estimate
halwa|Suji halwa|280|4|40|12|100|1 katori|Typical semolina halwa estimate
chana_puri|Chana + 2 puri|480|12|58|20|250|breakfast plate|Typical breakfast plate estimate
office_daal_roti|Office daal + 2 roti|360|14|52|8|220|2 roti + 1 katori daal|USDA lentils + typical roti combo
office_tikka_roti|Office tikka + 2 roti|420|28|46|12|240|tikka + 2 roti|Typical office lunch combo
dahi_chawal|Dahi chawal|280|8|48|6|300|1 plate|USDA rice + yogurt
chicken_tikka_salad|Chicken tikka salad|240|26|8|10|220|1 bowl|Typical tikka + salad estimate
protein_pancakes|Protein pancakes (3)|280|22|28|8|150|3 small|Recipe estimate from USDA flour + whey + egg
whey_water|Whey in water|120|24|3|1.5|30|1 scoop in water|Product label typical
coffee_milk|Coffee with milk|40|2|4|1.5|200|1 cup|Milk splash estimate
multigrain_bread|Multigrain bread (slice)|69|3.5|12|1.1|26|1 slice|USDA similar bread
guacamole|Guacamole|150|2|8|13|100|100 g|USDA avocado-based estimate
croissant|Croissant|231|4.7|26|12|57|1 medium|USDA FoodData Central 174990
seitan|Seitan|370|75|14|1.9|100|100 g|USDA wheat gluten similar
sweet_lassi_small|Sweet lassi (small)|120|4|18|3.5|180|small glass|Typical yogurt drink
rooh_afza_water|Rooh Afza water|80|0|20|0|250|1 glass|Syrup water estimate
oral_rehydration|ORS / electrolyte drink|10|0|2.5|0|200|200 ml|Product label typical
electrolyte_tab|Electrolyte tab in water|10|0|2|0|250|1 tab in 250 ml|Product label typical
boiled_egg_2|2 boiled eggs|144|12.6|0.8|9.6|100|2 large|USDA FoodData Central 748967 ×2
oats_milk|Oats cooked in milk|220|10|32|5|250|50 g oats + 200 ml milk|USDA oats + milk combo
apple_pb|Apple + 1 tbsp peanut butter|189|4.5|28.2|8.3|198|1 apple + 1 tbsp|USDA combo
rice_cake_pb|Rice cake + peanut butter|129|4.7|10.4|8.3|25|1 cake + 1 tbsp|USDA combo
chicken_wrap_light|Chicken wrap (no mayo)|360|28|36|10|180|1 wrap|USDA chicken + tortilla combo
dal_tadka_home|Home daal tadka (less oil)|140|9|20|3|140|1 katori|USDA lentils + 1 tsp oil
feta|Feta|264|14|4|21|100|100 g|USDA FoodData Central 173417
mozzarella|Mozzarella (part-skim)|254|24|2.8|16|100|100 g|USDA FoodData Central 173420
beet_salad|Beet salad|50|2|10|0.5|120|1 plate|USDA beetroot
protein_ice|High-protein yogurt ice (typical)|90|10|12|1.5|100|100 g|Product label typical
chickpeas_boiled|Boiled chickpeas|164|8.9|27.4|2.6|100|100 g cooked|USDA FoodData Central 173722
kidney_beans|Kidney beans (cooked)|127|8.7|22.8|0.5|100|100 g cooked|USDA FoodData Central 173735
mung_sprouts|Moong sprouts|30|3.0|5.9|0.2|100|100 g|USDA FoodData Central 174256 similar
pomegranate|Pomegranate arils|83|1.7|18.7|1.2|100|100 g|USDA FoodData Central 169134
guava|Guava|68|2.6|14.3|1|100|100 g|USDA FoodData Central 169122
papaya|Papaya|43|0.5|11|0.3|100|100 g|USDA FoodData Central 169926
okra|Okra (cooked)|22|1.9|4.5|0.2|100|100 g|USDA FoodData Central 169260
eggplant|Baingan (cooked)|35|0.8|8.7|0.2|100|100 g|USDA FoodData Central 169228
chicken_soup_clear|Clear chicken soup|70|8|4|2|250|1 bowl|USDA broth + chicken estimate
boiled_chicken_150|Boiled chicken (150 g)|248|46.5|0|5.4|150|150 g cooked|USDA FoodData Central 171477
rice_katori|Cooked rice (1 katori)|195|4|42|0.5|150|1 katori (~150 g)|USDA FoodData Central 168878
oats_bowl|Oats bowl (40 g dry + water)|156|6.8|26.5|2.8|40|40 g dry oats cooked in water|USDA FoodData Central 173904
almonds_10|Almonds (10)|70|2.5|2.6|6|12|10 almonds|USDA FoodData Central 170567
"""

def parse():
    rows = []
    seen = set()
    for line in RAW.strip().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("|")
        if len(parts) != 9:
            raise SystemExit(f"bad row ({len(parts)}): {line}")
        fid, name, cal, p, c, f, g, portion, source = parts
        if fid in seen:
            raise SystemExit("duplicate id " + fid)
        seen.add(fid)
        rows.append({
            "id": fid,
            "name": name,
            "cal": num(cal),
            "p": num(p),
            "c": num(c),
            "f": num(f),
            "g": num(g),
            "portion": portion,
            "source": source,
        })
    return rows

def num(s):
    v = float(s)
    return int(v) if v == int(v) else v

def js_str(s):
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"

def emit(rows):
    lines = []
    for r in rows:
        lines.append(
            "  { id: %s, name: %s, cal: %s, p: %s, c: %s, f: %s, g: %s, portion: %s, source: %s }"
            % (js_str(r["id"]), js_str(r["name"]), r["cal"], r["p"], r["c"], r["f"], r["g"],
               js_str(r["portion"]), js_str(r["source"]))
        )
    body = ",\n".join(lines)
    return """'use strict';
/* Offline food library — lite guidance, not a calorie tracker.
   Macros are per the labelled portion. Sources: USDA FoodData Central
   where a FDC id is given; mixed dishes are component estimates and will
   vary by kitchen. */
window.FOODS_DB = [
%s
];

window.FoodEngine = {
  search: function(q) {
    q = String(q || '').toLowerCase().trim();
    if (!q) return FOODS_DB.slice(0, 16);
    return FOODS_DB.filter(function(f) {
      return f.name.toLowerCase().indexOf(q) !== -1 || (f.id && f.id.indexOf(q) !== -1);
    }).slice(0, 24);
  },
  toMeal: function(food, servings) {
    servings = Number(servings) || 1;
    return {
      name: food.name + (servings !== 1 ? ' ×' + servings : ''),
      calories: Math.round(food.cal * servings),
      protein: Math.round(food.p * servings * 10) / 10,
      carbs: Math.round(food.c * servings * 10) / 10,
      fat: Math.round(food.f * servings * 10) / 10,
      date: (typeof today === 'function' ? today() : new Date().toISOString().slice(0, 10)),
      time: new Date().toTimeString().slice(0, 5),
      foodId: food.id,
      source: food.source || '',
      portion: food.portion || ''
    };
  }
};
""" % body

def main():
    rows = parse()
    if len(rows) < 200:
        raise SystemExit("need 200+ foods, got %d" % len(rows))
    out = Path(__file__).resolve().parents[1] / "js/data/foods-db.js"
    out.write_text(emit(rows))
    print("wrote", len(rows), "foods →", out)

if __name__ == "__main__":
    main()
