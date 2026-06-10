const PDFDocument = require('pdfkit')

/**
 * AWS Lambda handler — generates a PDF sale ticket and returns it as base64.
 * In production: upload to S3 and return the pre-signed URL.
 *
 * Event payload:
 * {
 *   saleId: string,
 *   modelName: string,
 *   buyerName: string,
 *   buyerEmail: string,
 *   salePrice: number,
 *   saleDate: string (ISO)
 * }
 */
exports.handler = async (event) => {
  const { saleId, modelName, buyerName, buyerEmail, salePrice, saleDate } = event

  if (!saleId || !modelName || !buyerName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields: saleId, modelName, buyerName' }),
    }
  }

  const pdfBuffer = await generatePDF({ saleId, modelName, buyerName, buyerEmail, salePrice, saleDate })

  // In production, upload pdfBuffer to S3 and return presigned URL
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      saleId,
      ticketPdfBase64: pdfBuffer.toString('base64'),
      generatedAt: new Date().toISOString(),
    }),
  }
}

function generatePDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const chunks = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(24).fillColor('#10b981').text('FitProject', { align: 'center' })
    doc.fontSize(14).fillColor('#666').text('Ticket de Compra', { align: 'center' })
    doc.moveDown()
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e5e7eb')
    doc.moveDown()

    doc.fontSize(12).fillColor('#000')
    doc.text(`N° de venta: ${data.saleId}`)
    doc.text(`Modelo: ${data.modelName}`)
    doc.text(`Comprador: ${data.buyerName}`)
    doc.text(`Email: ${data.buyerEmail}`)
    doc.text(`Precio: $${data.salePrice?.toLocaleString() ?? 'N/A'}`)
    doc.text(`Fecha: ${data.saleDate ? new Date(data.saleDate).toLocaleDateString('es-PE') : new Date().toLocaleDateString('es-PE')}`)

    doc.moveDown(2)
    doc.fontSize(10).fillColor('#666').text('Gracias por tu compra. FitProject — Gimnasios en contenedores.', { align: 'center' })

    doc.end()
  })
}