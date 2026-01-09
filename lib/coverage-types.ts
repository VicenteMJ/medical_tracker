/**
 * Coverage domain types for insurance policies
 */
export enum CoverageDomain {
  HEALTH = 'health',
  HOSPITALIZATION = 'hospitalization',
  MEDICATIONS = 'medications',
  DENTAL = 'dental',
  MATERNITY = 'maternity',
  MENTAL_HEALTH = 'mental_health',
  VISION = 'vision',
  LIFE = 'life',
  CATASTROPHIC = 'catastrophic',
}

/**
 * Service types for medical services in Chilean context
 */
export enum ServiceType {
  // General consultations
  CONSULTA_GENERAL = 'consulta_general',
  CONSULTA_ESPECIALISTA = 'consulta_especialista',
  
  // Laboratory and diagnostics
  EXAMEN_LABORATORIO = 'examen_laboratorio',
  IMAGENOLOGIA = 'imagenologia',
  
  // Procedures and treatments
  HOSPITALIZACION = 'hospitalizacion',
  CIRUGIA = 'cirugia',
  PROCEDIMIENTO = 'procedimiento',
  
  // Medications
  MEDICAMENTO = 'medicamento',
  
  // Dental services
  DENTAL_PREVENTIVO = 'dental_preventivo',
  DENTAL_RESTAURATIVO = 'dental_restaurativo',
  DENTAL_ORTOPEDICO = 'dental_ortopedico',
  DENTAL_CIRUGIA = 'dental_cirugia',
  
  // Vision services
  VISION_CONSULTA = 'vision_consulta',
  VISION_LENTES = 'vision_lentes',
  VISION_CIRUGIA = 'vision_cirugia',
  
  // Mental health
  MENTAL_CONSULTA = 'mental_consulta',
  MENTAL_TERAPIA = 'mental_terapia',
  
  // Emergency
  EMERGENCIA = 'emergencia',
  
  // Other
  OTRO = 'otro',
}

/**
 * Source of coverage data
 */
export enum CoverageSource {
  AI = 'ai',
  MANUAL = 'manual',
}

/**
 * Parameters for coverage eligibility query
 */
export interface CoverageQueryParams {
  serviceType?: string
  specialty?: string
  providerType?: string
  isEmergency?: boolean
  date?: Date
}

/**
 * Coverage match result
 */
export interface CoverageMatch {
  insurance: {
    id: string
    provider_name: string
    policy_id: string
    insurance_type: string | null
  }
  coverage: {
    id: string
    coverage_domain: string
    service_type: string
    specialty: string | null
    provider_type: string | null
    is_emergency: boolean | null
    coverage_percent: number | null
    max_amount: number | null
    currency: string | null
    deductible_amount: number | null
    copay_amount: number | null
    frequency_limit: string | null
    waiting_period_days: number | null
    exclusions: string | null
    conditions: string[] | null
    per_service_limit: number | null
    per_service_limit_currency: string | null
    confidence_score: number | null
    source: string
  }
  matchReasons: string[]
}

/**
 * Service type mapping for Chilean medical terminology
 */
export const SERVICE_TYPE_MAPPING: Record<string, ServiceType> = {
  // General consultations
  'consulta general': ServiceType.CONSULTA_GENERAL,
  'consulta médica general': ServiceType.CONSULTA_GENERAL,
  'médico general': ServiceType.CONSULTA_GENERAL,
  'atención primaria': ServiceType.CONSULTA_GENERAL,
  'consulta especialista': ServiceType.CONSULTA_ESPECIALISTA,
  'especialista': ServiceType.CONSULTA_ESPECIALISTA,
  'consulta especializada': ServiceType.CONSULTA_ESPECIALISTA,
  
  // Laboratory
  'laboratorio': ServiceType.EXAMEN_LABORATORIO,
  'examen laboratorio': ServiceType.EXAMEN_LABORATORIO,
  'exámenes de laboratorio': ServiceType.EXAMEN_LABORATORIO,
  'análisis clínico': ServiceType.EXAMEN_LABORATORIO,
  
  // Imaging
  'imagenología': ServiceType.IMAGENOLOGIA,
  'imagenologia': ServiceType.IMAGENOLOGIA,
  'radiología': ServiceType.IMAGENOLOGIA,
  'radiologia': ServiceType.IMAGENOLOGIA,
  'resonancia': ServiceType.IMAGENOLOGIA,
  'tomografía': ServiceType.IMAGENOLOGIA,
  'tomografia': ServiceType.IMAGENOLOGIA,
  'ecografía': ServiceType.IMAGENOLOGIA,
  'ecografia': ServiceType.IMAGENOLOGIA,
  
  // Hospitalization and surgery
  'hospitalización': ServiceType.HOSPITALIZACION,
  'hospitalizacion': ServiceType.HOSPITALIZACION,
  'internación': ServiceType.HOSPITALIZACION,
  'internacion': ServiceType.HOSPITALIZACION,
  'cirugía': ServiceType.CIRUGIA,
  'cirugia': ServiceType.CIRUGIA,
  'procedimiento': ServiceType.PROCEDIMIENTO,
  'procedimientos': ServiceType.PROCEDIMIENTO,
  
  // Medications
  'medicamentos': ServiceType.MEDICAMENTO,
  'medicamento': ServiceType.MEDICAMENTO,
  'fármacos': ServiceType.MEDICAMENTO,
  'farmacos': ServiceType.MEDICAMENTO,
  
  // Dental
  'dental': ServiceType.DENTAL_PREVENTIVO,
  'plan dental': ServiceType.DENTAL_PREVENTIVO,
  'seguro dental': ServiceType.DENTAL_PREVENTIVO,
  'cobertura dental': ServiceType.DENTAL_PREVENTIVO,
  'dental preventivo': ServiceType.DENTAL_PREVENTIVO,
  'prevención dental': ServiceType.DENTAL_PREVENTIVO,
  'prevencion dental': ServiceType.DENTAL_PREVENTIVO,
  'dental restaurativo': ServiceType.DENTAL_RESTAURATIVO,
  'restauración dental': ServiceType.DENTAL_RESTAURATIVO,
  'restauracion dental': ServiceType.DENTAL_RESTAURATIVO,
  'dental ortopédico': ServiceType.DENTAL_ORTOPEDICO,
  'dental ortopedico': ServiceType.DENTAL_ORTOPEDICO,
  'cirugía dental': ServiceType.DENTAL_CIRUGIA,
  'cirugia dental': ServiceType.DENTAL_CIRUGIA,
  'odontología': ServiceType.DENTAL_PREVENTIVO,
  'odontologia': ServiceType.DENTAL_PREVENTIVO,
  
  // Vision
  'consulta oftalmológica': ServiceType.VISION_CONSULTA,
  'consulta oftalmologica': ServiceType.VISION_CONSULTA,
  'oftalmología': ServiceType.VISION_CONSULTA,
  'oftalmologia': ServiceType.VISION_CONSULTA,
  'lentes': ServiceType.VISION_LENTES,
  'anteojos': ServiceType.VISION_LENTES,
  'cirugía ocular': ServiceType.VISION_CIRUGIA,
  'cirugia ocular': ServiceType.VISION_CIRUGIA,
  
  // Mental health
  'salud mental': ServiceType.MENTAL_CONSULTA,
  'psicología': ServiceType.MENTAL_CONSULTA,
  'psicologia': ServiceType.MENTAL_CONSULTA,
  'psiquiatría': ServiceType.MENTAL_CONSULTA,
  'psiquiatria': ServiceType.MENTAL_CONSULTA,
  'terapia psicológica': ServiceType.MENTAL_TERAPIA,
  'terapia psicologica': ServiceType.MENTAL_TERAPIA,
  
  // Emergency
  'emergencia': ServiceType.EMERGENCIA,
  'urgencia': ServiceType.EMERGENCIA,
  'atención de urgencia': ServiceType.EMERGENCIA,
  'atencion de urgencia': ServiceType.EMERGENCIA,
  
  // Life insurance
  'seguro de vida': ServiceType.OTRO,
  'vida': ServiceType.OTRO,
  'life insurance': ServiceType.OTRO,
  'seguro vida': ServiceType.OTRO,
  
  // General terms
  'condiciones generales': ServiceType.OTRO,
  'cobertura general': ServiceType.OTRO,
  'plan general': ServiceType.OTRO,
}

/**
 * Coverage domain keywords for classification
 */
export const COVERAGE_DOMAIN_KEYWORDS: Record<CoverageDomain, string[]> = {
  [CoverageDomain.HEALTH]: ['consulta', 'médico', 'medico', 'especialista', 'laboratorio', 'imagenología', 'imagenologia', 'procedimiento', 'ambulatorio', 'fonoaudiologia', 'kinesiologia', 'fisioterapia'],
  [CoverageDomain.HOSPITALIZATION]: ['hospitalización', 'hospitalizacion', 'internación', 'internacion', 'cirugía', 'cirugia', 'dia cama', 'día cama', 'uti', 'uci', 'pabellón', 'pabellon', 'servicios hospitalarios'],
  [CoverageDomain.MEDICATIONS]: ['medicamento', 'medicamentos', 'fármaco', 'farmaco', 'farmacia', 'receta', 'generico', 'genérico', 'antineoplasico', 'inmunosupresor'],
  [CoverageDomain.DENTAL]: ['dental', 'odontología', 'odontologia', 'diente', 'muela', 'ortodoncia', 'plan dental', 'seguro dental', 'cobertura dental'],
  [CoverageDomain.MATERNITY]: ['maternidad', 'parto', 'embarazo', 'cesárea', 'cesarea', 'fertilidad', 'esterilidad', 'aborto', 'complicaciones del embarazo', 'complicaciones del parto'],
  [CoverageDomain.MENTAL_HEALTH]: ['mental', 'psicología', 'psicologia', 'psiquiatría', 'psiquiatria', 'terapia', 'salud mental'],
  [CoverageDomain.VISION]: ['oftalmología', 'oftalmologia', 'visual', 'lente', 'anteojo', 'ojo', 'óptico', 'optico'],
  [CoverageDomain.LIFE]: ['vida', 'life insurance', 'seguro de vida', 'seguro vida', 'muerte', 'fallecimiento', 'beneficio por muerte'],
  [CoverageDomain.CATASTROPHIC]: ['ges', 'caec', 'catastrófico', 'catastrofico', 'evento catastrófico', 'evento catastrofico'],
}

