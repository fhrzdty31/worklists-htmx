const path = require("path")
const { log, error } = require("console")
const express = require("express")
const { PrismaClient } = require("@prisma/client")

const app = express()
const prisma = new PrismaClient()

app.use(express.static(path.join(__dirname, 'node_modules/htmx.org/dist')))
app.use(express.urlencoded({ extended: true }))

app.get("/", (_, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')))

app.get("/work", async (_, res) => {
    try {
        const lists = await prisma.work.findMany({
            orderBy: {
                created_at: "desc"
            }
        })
        
        if (lists.length <= 0) {
            return res.send('<h1>Tidak ada data</h1>')
        }

        let html = ''
        lists.map(
            list => html += `<li id="${list.id}">${list.title} | <span hx-delete="/work/${list.id}" hx-trigger="click" hx-swap="outerHTML" hx-target="#${list.id}">❌</span></li>`
        )
        return res.send(html)
    } catch (e) {
        return res.send('<h1>Gagal memuat data</h1>')
    }
})

app.post("/work", async (req, res) => {
    try {
        const { title } = req.body

        if (!title) throw Error()

        try {
            await prisma.work.create({
                data: {
                    title
                }
            })

            return res.send("Berhasil menambah list")
        } catch (e) {
            return res.send("Gagal menambah list!!")
        }
    } catch (e) {
        return res.send("Tolong masukkan kegiatanmu!!")
    }
})

app.delete("/work/:id", async (req, res) => {
    try {
        const { id } = req.params

        if (!id) throw Error()

        try {
            await prisma.work.delete({
                where: {
                    id
                }
            })

            return res.send()
        } catch (e) {
            return res.send("Gagal menghapus list!!")
        }
    } catch (e) {
        return res.send("Gagal menghapus list!!")
    }
})

try {
    app.listen(
        80,
        () => log("Server is runing!!")
    )
} catch(e) {
    error(e)
}