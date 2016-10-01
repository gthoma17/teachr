import web, ConfigParser, json, sys, urllib, requests, tempfile, socket, base64
from os import path
from identitytoolkit import gitkitclient

#prepare to read config
config = ConfigParser.ConfigParser()
root = path.dirname(path.realpath(__file__))

config.read(path.join(root, "webui.cfg"))

#create out google identity kit
key_file = open(config.get("Google", "PrivateKeyFile"), 'rb')
key = key_file.read()
key_file.close()
gitkit_instance = gitkitclient.GitkitClient(
      client_id=config.get("Google", "clientId"),
      service_account_email=config.get("Google", "serviceAccountEmail"),
      service_account_key=key,
      widget_url=config.get("Google", "widgetUrl"),
      cookie_name=config.get("Google", "cookieName"))


web.config.debug = True
debug = False

urls = (
	"/", "index",
	"/login", "login",
	"/logout", "logout",
	"/dashboard", "dashboard",
	"/update", "update",
	"/admin","admin",
	"/jobs", "jobs",
	"/job/(.*)", "job",
	"/newJob", "newJob",
	"/forward/(.*)", "forward",
	"/test","test",
	"/reports","reports"
	)
render = web.template.render(path.join(root,'templates/'))
app = web.application(urls, globals())

apiUrl = config.get("Backend", "url")

globallyAllowedUsers = ['gatlp9@gmail.com', 'greg@jobn.io']

# Hack to make session play nice with the reloader (in debug mode)
if web.config.get('_session') is None:
    session = web.session.Session(app, web.session.DiskStore(path.join(root,'sessions')), initializer={'user': {'state':None, 'isAdmin':0}})
    web.config._session = session
else:
    session = web.config._session

class index:
	def GET(self):
		gtoken = web.cookies().get('gtoken')
		if gtoken is not None:
			gVars = vars(gitkit_instance.VerifyGitkitToken(gtoken))
			if not session.user.has_key('isInTable'):
				if session.user['state'] != 'unregistered':
					#preserve redirect
					if 'redirect' in session.user:
						redirect_location = session.user['redirect']
					session.user = makeUserSession(gVars)
		else:
			session.user['state'] = None
			session.user['company'] = web.ctx.host.split('.')[0]

		if session.user['state'] == "registered":
			try:
				raise web.seeother(redirect_location)
			except NameError:
				print session.user
				raise web.seeother('dashboard')
		elif session.user['state'] == "unregistered":
			text = "You have logged in with Google, but are not a member of this company. Please contact your administrator if you feel you need access" 
			if debug:
				text += ".... here is your session info: " + str(session.user)
			title = "Are you sure you work here?"
			return render.unregistered(title, text)
		elif session.user['state'] == None:
			text = "" 
			if debug:
				text += "Here is your session info: "  + str(session.user)
			if 'redirect' in session.user:
				title = "You have to sign in to do that!"
			else:
				title = "Welcome, Stranger! "
			return render.unauthed(title, text)
		else:
			text = "Strange error. Contact an admin." 
			if debug:
				text += "Here is your session info: "  + str(session.user)
			title = "Wait.. what?"
			return render.index(title, text)

class test:
	def GET(self):
		return render.test()
			
class forward:
	def GET(self, path):
		apiRequest = urllib.urlopen(apiUrl+"/"+path+"?apiKey="+session.user['apiKey']+"&company="+session.user['company']).read()
		return apiRequest
	def POST(self, path):
		try:
			passedData = dict(json.loads(web.data()))
		except Exception, e:
			return e 
		passedData['apiKey'] = session.user['apiKey']
		passedData['company'] = session.user['company']
		apiRequest = requests.post(apiUrl+"/"+path, data=passedData)
		return apiRequest.text
class jobs:
	def GET(self):
		if not userAuthed(session.user):
			session.user['redirect'] = web.ctx.path
			raise web.seeother('/')
		response = urllib.urlopen(apiUrl+"/job/all?company="+session.user['company']+"&apiKey="+session.user['apiKey']).read()
		try:
			return render.jobs("::JOBS::", json.loads(response))
		except ValueError: 
			# that's no json...
			return render.error(response)
class job:
	def GET(self, job):
		if not userAuthed(session.user):
			session.user['redirect'] = web.ctx.path
			raise web.seeother('/')
		if session.user.has_key('budgetResponse'):
			budgetResponse = session.user['budgetResponse']
			del session.user['budgetResponse']
		else:
			budgetResponse = ""
		response = urllib.urlopen(apiUrl+"/job/"+str(job)+"?apiKey="+session.user['apiKey']+"&company="+session.user['company']).read()
		try:
			return render.job(json.loads(response), session.user, apiUrl)
		except ValueError: 
			# that's no json...
			return render.error(response)
class newJob:
	def GET(self):
		if not userAuthed(session.user):
			session.user['redirect'] = web.ctx.path
			raise web.seeother('/')
		if not userAuthed(session.user) or not userIsAdmin(session.user):
			raise web.seeother('/')
		if session.user.has_key('apiResponse'):
			response = session.user['apiResponse']
			del session.user['apiResponse']
		else:
			response = ""
        #newStuuf!
		newJobVals = {}
		newJobVals['name'] = ""
		newJobVals['street_address'] = ""
		newJobVals['city'] = ""
		newJobVals['state'] = ""
		newJobVals['zip'] = ""
		newJobVals['phase'] = "open"
		newJobVals['description'] = ""
		newJobVals['date_started'] = ""
		newJobVals['id'] = "new"
		newJobVals['date_closed'] = ""
		newJobVals['date_billed'] = ""
		newJobVals['photos'] = ""
		newJobVals['notes'] = ""
		newJobVals['customer_name'] = ""
		newJobVals['customer_phone'] = ""
		newJobVals['customer_email'] = ""
		newJobVals['supervisor'] = None
		newJobVals['manager'] = None
		newJobVals['isNewJob'] = True
		return render.job(newJobVals, session.user, apiUrl)
class login:
	def GET(self):
		return render.login(session.user['company']+"."+config.get("WebUi","url"), config.get("Google","apiKey"))

class logout:
	def GET(self):
		session.user = {'state':None, 'isAdmin':0}
		raise web.seeother('/')
class dashboard:
	def GET(self):
		if not userAuthed(session.user):
			session.user['redirect'] = web.ctx.path
			raise web.seeother('/')
		text = "You are a registered user "
		adminLink = " "
		if userIsAdmin(session.user):
			text += "and an admin"
			adminLink += "<a href=\"admin\" class=\"adminButton\">Admin Panel</a>"
		if debug:
			text += "..... here is your session info: " + str(session.user)
		text += "."
		title = "Welcome back, " + session.user['name'] + "!" 
		userJobs = urllib.urlopen(apiUrl+"/userJobs?apiKey="+session.user['apiKey']+"&company="+session.user['company']).read()
		userJobs= json.loads(userJobs)
		userActionItems = urllib.urlopen(apiUrl+"/userActionItems?apiKey="+session.user['apiKey']+"&company="+session.user['company']).read()
		userActionItems= json.loads(userActionItems)
		return render.dashboard(title, text, adminLink, session.user, userJobs, userActionItems)
class reports:
	def GET(self):
		if not userAuthed(session.user):
			session.user['redirect'] = web.ctx.path
			raise web.seeother('/')
		text = "You are a registered user "
		adminLink = " "
		if userIsAdmin(session.user):
			text += "and an admin"
			adminLink += "<a href=\"admin\" class=\"adminButton\">Admin Panel</a>"
		if debug:
			text += "..... here is your session info: " + str(session.user)
		text += "."
		title = "Welcome back, " + session.user['name'] + "!" 
		userJobs = urllib.urlopen(apiUrl+"/job/all?apiKey="+session.user['apiKey']+"&company="+session.user['company']).read()
		userJobs= json.loads(userJobs)
		return render.reports(title, text, adminLink, session.user, userJobs)
class admin:
	def GET(self):
		if not userAuthed(session.user):
			session.user['redirect'] = web.ctx.path
			raise web.seeother('/')
		if not userAuthed(session.user) or not userIsAdmin(session.user):
			raise web.seeother('/')
		if session.user.has_key('apiResponse'):
			response = session.user['apiResponse']
			del session.user['apiResponse']
		else:
			response = ""
		allUsers = urllib.urlopen(apiUrl+"/user/all?apiKey="+session.user['apiKey']+"&company="+session.user['company']).read()
		try:
			return render.admin(response, json.loads(allUsers))
		except ValueError: 
			# that's no json...
			return render.error(response)

class update:
	form = web.form.Form(
        web.form.Checkbox('acknowledge',
        	description="You're sure you want to update right now?",
        	value="acknowledged"),
        web.form.Button('Do the Update!'),
    )
	def GET(self):
		text = "While updating the site will be unavailiable to you and your project mates for up to a minute. Are you sure now is a good time?"
                return render.text_form(text, self.form)		

def userIsAdmin(user):
	if user['permissionLevel'].upper() == "ADMIN":
		return True
	else:
		return False
def userAuthed(user):
	if user.has_key('apiKey'):
		return True
	else:
		return False

def makeUserSession(gVars):
	session = gVars
	session['state'] = "unregistered"
	session['company'] = web.ctx.host.split('.')[0]
	#try to ask backend for this user's info
	response = urllib.urlopen(apiUrl+"/user/"+gVars['email']+"?company="+session['company']).read()
	if gVars['email'] in globallyAllowedUsers:
		session.update({'email':gVars['email'], 'id':'1', 'name':'superadmin', 'permissionLevel':'admin', 'apiKey':'superadmin'})
		session['state'] = "registered"
	elif response[0:3] != '404':
		session.update(dict(json.loads(response)))
		session['state'] = "registered"
	print session
	return session

if __name__ == "__main__":
	app.run()
