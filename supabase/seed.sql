-- Roasteries
insert into roasteries (id, name, city, color, emoji, website, description, tags) values
('father','Father Coffee','Johannesburg','#2A1810','☕','father.coffee','JHB''s most innovative specialty roaster. 46+ coffees annually, rare Geisha releases, vacuum fermentation.',
 array['Microlots','Experimental','Geisha specialist']),
('beanthere','Bean There Coffee Company','Johannesburg','#1E2A18','🌍','beanthere.co.za','Pioneer of direct trade in SA since 2006. Exclusively African single origins.',
 array['Direct trade','African only','Fair trade']),
('seam','Seam Coffee','Johannesburg','#282018','🌱','seam.co.za','Founded 2017 by David Walstra. Campbell Road blend. Direct trade Fourways roastery.',
 array['Direct trade','Fourways','Sustainable']),
('rosetta','Rosetta Roastery','Cape Town','#1A2A18','🌿','rosettaroastery.com','Award-winning Cape Town roaster. Classic and Progressive tiers. Direct trade.',
 array['Award-winning','Direct trade','CPT icon']),
('truth','Truth. Coffee','Cape Town','#201820','⚙️','truth.coffee','World''s best café 2014. Steampunk. Destination café Buitenkant St.',
 array['World-class','Steampunk']),
('origin','Origin Coffee Roasting','Cape Town','#182028','🔬','originroasting.co.za','Founded 2005. Godfather of SA specialty. Widest single-origin selection in SA.',
 array['Pioneer','Widest selection','De Waterkant']);

-- Beans
insert into beans (id, roastery_id, name, origin, process, roast, score, price, flavors, acidity, body, sweetness, fruitiness, intensity, aroma, finish, trend, methods) values
('f1','father','Antimaceration Geisha by El Paraíso','Colombia','Vacuum Fermented','Light',91,'R529',
 array['Guava','Pineapple','Passionfruit','Cola','Cacao'],8.5,8,8,10,9,9,8,'hot',array['V60','Chemex','Filter']),
('f2','father','Lalesa Black Honey, Yirgacheffe','Ethiopia','Black Honey','Light',87.5,'R359',
 array['Guava','Apricot','Toffee','Mango'],7,6,9,9,7,8,7.5,'rising',array['V60','AeroPress','Espresso']),
('f3','father','K Organics Anaerobic Natural, Huye','Rwanda','Anaerobic Natural','Light',93,'R1379',
 array['Blueberry jam','Hibiscus','Dark chocolate','Red wine'],8,7,9.5,9.5,8.5,9,9,'rising',array['V60','Cold brew']),
('f4','father','Pink Bourbon by Diego Bermudez','Colombia','Washed','Light',89,'R489',
 array['Rose','Raspberry','Lychee'],8,4.5,8.5,8.5,5,8.5,7.5,'steady',array['V60','Filter']),
('bt1','beanthere','Ethiopia Single Origin','Ethiopia','Washed','Light-Medium',86,'R155',
 array['Jasmine','Bergamot','Lemon','Peach'],8.5,3.5,6.5,8.5,4.5,8.5,7,'hot',array['V60','Batch brew']),
('bt2','beanthere','Kenya Single Origin','Kenya','Washed','Light-Medium',87,'R155',
 array['Blackcurrant','Brown sugar','Citrus'],9,5,6.5,8.5,6,7.5,7.5,'steady',array['V60','Espresso']),
('bt3','beanthere','Rwanda Single Origin','Rwanda','Washed','Light',86,'R150',
 array['Peach','Rose','Orange zest'],7.5,4.5,8,7.5,4.5,8,7,'new',array['V60','AeroPress']),
('bt4','beanthere','Burundi Single Origin','Burundi','Washed','Light-Medium',85,'R140',
 array['Black plum','Cinnamon','Dark chocolate'],7.5,5.5,7.5,7,5.5,7.5,7.5,'steady',array['Espresso','Milk drink']),
('sm1','seam','Campbell Road House Blend','Ethiopia / Colombia','Mixed','Medium',85,'R185',
 array['Milk chocolate','Treacle sugar','Brown sugar'],5.5,6.5,8.5,5,6,7,7,'steady',array['Espresso','Milk drink']),
('sm2','seam','Ethiopia Yirgacheffe Single Origin','Ethiopia','Washed','Light',87,'R210',
 array['Jasmine','Lemon','Bergamot'],8.5,3.5,7,9,4.5,9,7.5,'rising',array['V60','Filter']),
('sm3','seam','Rwanda Nyamasheke Natural','Rwanda','Natural','Light',88,'R220',
 array['Strawberry','Hibiscus','Rose','Honey'],7,5.5,9,8.5,5,8.5,8,'rising',array['V60','Cold brew']),
('r1','rosetta','Yirgacheffe Kochere','Ethiopia','Washed','Light',92,'R260',
 array['Bergamot','Lemon','White jasmine'],9,3,7,9,3.5,9.5,8,'hot',array['V60','Filter']),
('r2','rosetta','Kenya Thiriku AA','Kenya','Washed','Light-Medium',91,'R275',
 array['Blackcurrant','Peach','Brown sugar'],8.5,5.5,7,8,5.5,8,8,'rising',array['V60','Espresso']),
('t1','truth','The Gospel — Ethiopia Gedeb','Ethiopia','Washed','Light',92,'R255',
 array['Jasmine','Bergamot','White peach'],8.5,3.5,7.5,9,4,9.5,8.5,'rising',array['V60','Chemex']),
('o1','origin','Ethiopia Yirgacheffe Washed','Ethiopia','Washed','Light',90,'R245',
 array['Bergamot','Floral','Citrus'],8.5,3.5,7,9,4,9,8,'hot',array['V60','Siphon']),
('o2','origin','Kenya Nyeri AB','Kenya','Washed','Light-Medium',89,'R260',
 array['Blackcurrant','Peach','Wine-like'],8.5,5,7,8.5,5.5,8,8,'rising',array['Espresso','V60']);

-- Cafes
insert into cafes (roastery_id, name, addr, lat, lng, hours) values
('father','Father Kramerville','142 Fox St, Kramerville',-26.2041,28.0473,'Mon–Sat 7–17'),
('father','Father Rosebank','The Zone, Oxford Rd',-26.1472,28.0438,'Mon–Sun 7–18'),
('beanthere','Bean There Braamfontein','25 Paul Nel St, Braamfontein',-26.1934,28.0345,'Mon–Sat 7–17'),
('seam','Seam Fourways','75 Century Blvd, Riversands',-26.0001,28.0024,'Mon–Fri 7–17'),
('rosetta','Rosetta De Waterkant','8 Jarvis St, De Waterkant',-33.9166,18.4182,'Mon–Sun 7–18'),
('truth','Truth Buitenkant','36 Buitenkant St',-33.9249,18.4241,'Mon–Sat 7–18'),
('origin','Origin De Waterkant','28 Hudson St',-33.9162,18.4188,'Mon–Sun 7–17');
