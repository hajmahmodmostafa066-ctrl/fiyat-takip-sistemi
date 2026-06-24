from flask import Flask, render_template, request, redirect, session, url_for
import sqlite3
from functools import wraps
import os

app = Flask(__name__)
app.secret_key = 'mekanik_tesisat_gizli_anahtar'

# Sadece bu listedeki mail adresleri sisteme giriş yapabilir.
ALLOWED_EMAILS = ['mustafahacmahmut02@gmail.com']

def init_db():
    conn = sqlite3.connect('fiyatlar.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS teklifler
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  parca_adi TEXT, 
                  firma TEXT, 
                  marka TEXT, 
                  fiyat REAL)''')
    conn.commit()
    conn.close()

init_db()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'email' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        if email in ALLOWED_EMAILS:
            session['email'] = email
            return redirect(url_for('index'))
        else:
            return "Sisteme giriş izniniz yok!", 403
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('email', None)
    return redirect(url_for('login'))

@app.route('/', methods=['GET', 'POST'])
@login_required
def index():
    conn = sqlite3.connect('fiyatlar.db')
    c = conn.cursor()
    
    if request.method == 'POST':
        parca_adi = request.form['parca_adi'].upper()
        firma = request.form['firma'].upper()
        marka = request.form['marka'].upper()
        fiyat = request.form['fiyat']
        
        c.execute("SELECT id FROM teklifler WHERE parca_adi=? AND firma=? AND marka=?", (parca_adi, firma, marka))
        kayit = c.fetchone()
        
        if kayit:
            c.execute("UPDATE teklifler SET fiyat=? WHERE id=?", (fiyat, kayit[0]))
        else:
            c.execute("INSERT INTO teklifler (parca_adi, firma, marka, fiyat) VALUES (?, ?, ?, ?)", 
                      (parca_adi, firma, marka, fiyat))
        conn.commit()

    arama = request.args.get('arama', '')
    if arama:
        c.execute("SELECT * TypE FROM teklifler WHERE parca_adi LIKE ?", ('%' + arama.upper() + '%',))
    else:
        c.execute("SELECT * FROM teklifler")
        
    teklifler = c.fetchall()
    
    c.execute("SELECT DISTINCT parca_adi FROM teklifler")
    parcalar = [row[0] for row in c.fetchall()]
    
    conn.close()
    return render_template('index.html', teklifler=teklifler, parcalar=parcalar, arama=arama)

if __name__ == '__main__':
    app.run(debug=True)